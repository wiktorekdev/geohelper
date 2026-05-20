mod conn;
mod resolver;
mod rpc;
mod target;

use std::sync::Arc;
use std::time::{Duration, Instant, SystemTime, UNIX_EPOCH};

use anyhow::Result;
use base64::Engine;
use futures_util::stream::FuturesUnordered;
use futures_util::{future::BoxFuture, FutureExt, StreamExt};
use serde_json::{json, Value};
use tauri::{AppHandle, Emitter};
use tokio::sync::mpsc;
use tokio_tungstenite::connect_async;
use tokio_tungstenite::tungstenite::Message;

use crate::geo::is_valid;
use crate::state::{ConnState, Coords, Shared};
use crate::util::{LimitedMap, LimitedSet};

use conn::Conn;

const BURST_DEBOUNCE: Duration = Duration::from_millis(10);
const ROUND_IDLE_GAP: Duration = Duration::from_millis(250);
const RESOLVE_TIMEOUT: Duration = Duration::from_secs(3);
const RETRY_MIN: Duration = Duration::from_secs(1);
const RETRY_MAX: Duration = Duration::from_secs(30);
const MAX_BATCH: usize = 24;
const MAX_CONCURRENT_RESOLVES: usize = 4;
const MAX_REMEMBERED: usize = 1000;
const MAX_RESOLVE_ATTEMPTS: u8 = 3;

pub async fn run(app: AppHandle, state: Shared) {
    let mut retry_delay = RETRY_MIN;

    loop {
        let reconnect_epoch = state.reconnect_epoch();
        state.set_conn(ConnState::Searching);
        emit_status(&app, &state);

        match attempt(&app, &state, reconnect_epoch).await {
            Ok(AttemptEnd::ReconnectRequested) => {
                retry_delay = RETRY_MIN;
                log_line(&app, "info", "Reconnect requested");
            }
            Ok(AttemptEnd::Ended) => {
                retry_delay = RETRY_MIN;
            }
            Err(e) => {
                eprintln!("[cdp] {e}");
                log_line(&app, "error", format!("{e}"));
                state.set_conn(ConnState::Disconnected {
                    reason: format!("{e}"),
                });
                emit_status(&app, &state);
            }
        }

        tokio::select! {
            _ = tokio::time::sleep(retry_delay) => {
                retry_delay = (retry_delay * 2).min(RETRY_MAX);
            }
            _ = state.kick.notified() => {
                retry_delay = RETRY_MIN;
            }
        }
    }
}

enum AttemptEnd {
    Ended,
    ReconnectRequested,
}

async fn attempt(app: &AppHandle, state: &Shared, reconnect_epoch: u64) -> Result<AttemptEnd> {
    let target = target::find().await?;
    log_line(
        app,
        "info",
        format!(
            "target: {}",
            if target.title.is_empty() {
                &target.url
            } else {
                &target.title
            }
        ),
    );

    let (ws, _) = connect_async(&target.ws_url).await?;
    let (write, mut read) = ws.split();
    let conn = Conn::new(write);

    let (evt_tx, evt_rx) = mpsc::channel::<NetworkEvent>(1024);
    let (close_tx, mut close_rx) = mpsc::channel::<()>(1);
    let (pong_tx, mut pong_rx) = mpsc::channel::<()>(10);

    let conn_clone = conn.clone();
    let reader = tokio::spawn(async move {
        while let Some(msg) = read.next().await {
            let Ok(msg) = msg else { break };
            match msg {
                Message::Text(text) => {
                    let v: Value = match serde_json::from_str(&text) {
                        Ok(v) => v,
                        Err(_) => continue,
                    };

                    if let Some(id) = v.get("id").and_then(|i| i.as_u64()) {
                        conn_clone.resolve(id, v);
                    } else if let Some(method) = v.get("method").and_then(|m| m.as_str()) {
                        if let Some(evt) = parse_event(method, &v) {
                            match evt_tx.try_send(evt) {
                                Ok(()) => {}
                                Err(mpsc::error::TrySendError::Full(_)) => {}
                                Err(mpsc::error::TrySendError::Closed(_)) => break,
                            }
                        }
                    }
                }
                Message::Pong(_) => {
                    let _ = pong_tx.try_send(());
                }
                _ => {}
            }
        }
        let _ = close_tx.send(()).await;
    });

    let (heartbeat_failed_tx, mut heartbeat_failed_rx) = mpsc::channel::<()>(1);
    let conn_ping = conn.clone();
    let heartbeater = tokio::spawn(async move {
        tokio::time::sleep(Duration::from_secs(10)).await;
        let mut interval = tokio::time::interval(Duration::from_secs(15));
        loop {
            interval.tick().await;
            if conn_ping.ping().await.is_err() {
                let _ = heartbeat_failed_tx.try_send(());
                break;
            }
            match tokio::time::timeout(Duration::from_secs(5), pong_rx.recv()).await {
                Ok(Some(())) => {}
                _ => {
                    let _ = heartbeat_failed_tx.try_send(());
                    break;
                }
            }
        }
    });

    state.set_conn(ConnState::Connected);
    emit_status(app, state);
    log_line(app, "success", "CDP connected");

    conn.call("Network.enable", json!({})).await?;
    tokio::spawn(prewarm_google_maps(conn.clone(), app.clone()));

    let result = tokio::select! {
        res = controller(app.clone(), state.clone(), reconnect_epoch, conn.clone(), evt_rx) => {
            res.map(|end| match end {
                ControllerEnd::Ended => AttemptEnd::Ended,
                ControllerEnd::ReconnectRequested => AttemptEnd::ReconnectRequested,
            })
        },
        _ = close_rx.recv() => Err(anyhow::anyhow!("WebSocket closed")),
        _ = heartbeat_failed_rx.recv() => Err(anyhow::anyhow!("CDP Heartbeat timeout")),
    };

    reader.abort();
    heartbeater.abort();
    result
}

async fn wait_for_reconnect(state: Shared, seen_epoch: u64) {
    loop {
        state.kick.notified().await;
        if state.reconnect_epoch() != seen_epoch {
            return;
        }
    }
}

#[derive(Debug)]
enum NetworkEvent {
    Response { request_id: String, url: String },
    LoadingFinished { request_id: String },
    LoadingFailed { request_id: String },
}

enum ControllerEnd {
    Ended,
    ReconnectRequested,
}

#[derive(Debug, Clone)]
struct PanoCandidate {
    request_id: String,
    pano: String,
    attempts: u8,
}

impl PanoCandidate {
    fn key(&self) -> String {
        format!("{}:{}", self.request_id, self.pano)
    }
}

fn parse_event(method: &str, v: &Value) -> Option<NetworkEvent> {
    let p = v.get("params")?;
    let request_id = p.get("requestId")?.as_str()?.to_string();
    match method {
        "Network.responseReceived" => {
            let url = p
                .get("response")
                .and_then(|r| r.get("url"))
                .and_then(|u| u.as_str())
                .unwrap_or("")
                .to_string();
            Some(NetworkEvent::Response { request_id, url })
        }
        "Network.loadingFinished" => Some(NetworkEvent::LoadingFinished { request_id }),
        "Network.loadingFailed" => Some(NetworkEvent::LoadingFailed { request_id }),
        _ => None,
    }
}

async fn controller(
    app: AppHandle,
    state: Shared,
    reconnect_epoch: u64,
    conn: Arc<Conn>,
    mut events: mpsc::Receiver<NetworkEvent>,
) -> Result<ControllerEnd> {
    let mut rpc_requests: std::collections::HashSet<String> = Default::default();
    let mut burst: Vec<PanoCandidate> = Vec::new();
    let mut burst_seen: std::collections::HashSet<String> = Default::default();
    let mut batch: std::collections::VecDeque<PanoCandidate> = Default::default();
    let mut pending_resolves = FuturesUnordered::<BoxFuture<'static, ResolvedCandidate>>::new();
    let mut zero_results = LimitedSet::<String>::new(MAX_REMEMBERED);
    let mut resolved_cache = LimitedMap::<String, (f64, f64)>::new(MAX_REMEMBERED);
    let mut emitted_panos = LimitedSet::<String>::new(MAX_REMEMBERED);
    let mut location_locked = false;
    let mut last_pano_rpc_at: Option<Instant> = None;

    let far_future = Instant::now() + Duration::from_secs(60 * 60);
    let mut burst_deadline = far_future;

    loop {
        while pending_resolves.len() < MAX_CONCURRENT_RESOLVES {
            let Some(candidate) = batch.pop_front() else {
                break;
            };

            let pano = candidate.pano.clone();
            if zero_results.contains(&pano) || emitted_panos.contains(&pano) {
                continue;
            }

            if let Some((lat, lng)) = resolved_cache.get(&pano) {
                if try_update(&state, &app, &mut emitted_panos, &candidate, lat, lng) {
                    batch.clear();
                    pending_resolves.clear();
                }
                continue;
            }

            pending_resolves.push(resolve_candidate(conn.clone(), candidate).boxed());
        }

        let burst_active = !burst.is_empty();
        let resolving = !pending_resolves.is_empty();

        tokio::select! {
            evt = events.recv() => {
                let Some(evt) = evt else { return Ok(ControllerEnd::Ended); };
                match evt {
                    NetworkEvent::Response { request_id, url } => {
                        if is_maps_rpc_url(&url) {
                            rpc_requests.insert(request_id);
                        }
                    }
                    NetworkEvent::LoadingFailed { request_id } => {
                        rpc_requests.remove(&request_id);
                    }
                    NetworkEvent::LoadingFinished { request_id } => {
                        if !rpc_requests.remove(&request_id) { continue; }
                        if let Ok(text) = fetch_body(&conn, &request_id).await {
                            let panos = rpc::extract_panos(&text);
                            let now = Instant::now();
                            if !panos.is_empty() {
                                let round_gap = last_pano_rpc_at
                                    .map(|last| now.duration_since(last) >= ROUND_IDLE_GAP)
                                    .unwrap_or(true);
                                last_pano_rpc_at = Some(now);
                                if location_locked && round_gap {
                                    location_locked = false;
                                    burst.clear();
                                    burst_seen.clear();
                                    batch.clear();
                                    pending_resolves.clear();
                                    emitted_panos.clear();
                                    log_line(&app, "info", "new pano burst after idle; resolver unlocked");
                                }
                            }
                            if location_locked {
                                continue;
                            }
                            for pano in panos {
                                if burst.len() >= MAX_BATCH { break; }
                                let candidate = PanoCandidate {
                                    request_id: request_id.clone(),
                                    pano,
                                    attempts: 0,
                                };
                                if emitted_panos.contains(&candidate.pano) {
                                    continue;
                                }
                                if burst_seen.insert(candidate.key()) {
                                    burst.push(candidate);
                                }
                            }
                            if !burst.is_empty() {
                                burst_deadline = Instant::now() + BURST_DEBOUNCE;
                            }
                        }
                    }
                }
            }

            _ = tokio::time::sleep_until(burst_deadline.into()), if burst_active => {
                let drained = std::mem::take(&mut burst);
                burst_seen.clear();
                burst_deadline = far_future;
                batch.clear();
                batch.extend(drained);
            }

            resolved = pending_resolves.next(), if resolving => {
                let Some(resolved) = resolved else { continue; };
                match handle_resolved(
                    &state,
                    &app,
                    &mut emitted_panos,
                    &mut zero_results,
                    &mut resolved_cache,
                    resolved,
                ) {
                    ResolveAction::Accepted => {
                        location_locked = true;
                        batch.clear();
                        pending_resolves.clear();
                    }
                    ResolveAction::Retry(candidate) => {
                        batch.push_back(candidate);
                    }
                    ResolveAction::Continue => {}
                }
            }

            _ = wait_for_reconnect(state.clone(), reconnect_epoch) => {
                rpc_requests.clear();
                burst.clear();
                burst_seen.clear();
                batch.clear();
                pending_resolves.clear();
                log_line(&app, "info", "Reconnect requested; cleared pending CDP work");
                return Ok(ControllerEnd::ReconnectRequested);
            }
        }
    }
}

struct ResolvedCandidate {
    candidate: PanoCandidate,
    outcome: ResolveOutcome,
}

enum ResolveAction {
    Accepted,
    Retry(PanoCandidate),
    Continue,
}

fn handle_resolved(
    state: &Shared,
    app: &AppHandle,
    emitted_panos: &mut LimitedSet<String>,
    zero_results: &mut LimitedSet<String>,
    resolved_cache: &mut LimitedMap<String, (f64, f64)>,
    resolved: ResolvedCandidate,
) -> ResolveAction {
    let mut candidate = resolved.candidate;
    let pano = candidate.pano.clone();
    match resolved.outcome {
        ResolveOutcome::Resolved { lat, lng } => {
            resolved_cache.insert(pano, (lat, lng));
            if try_update(state, app, emitted_panos, &candidate, lat, lng) {
                ResolveAction::Accepted
            } else {
                ResolveAction::Continue
            }
        }
        ResolveOutcome::NotFound => {
            zero_results.insert(pano);
            ResolveAction::Continue
        }
        outcome @ (ResolveOutcome::GoogleNotReady
        | ResolveOutcome::Timeout
        | ResolveOutcome::Transient(_)) => {
            candidate.attempts = candidate.attempts.saturating_add(1);
            if candidate.attempts < MAX_RESOLVE_ATTEMPTS {
                log_line(
                    app,
                    "info",
                    format!(
                        "retrying pano {} after {} (attempt {}/{})",
                        candidate.pano,
                        outcome,
                        candidate.attempts + 1,
                        MAX_RESOLVE_ATTEMPTS
                    ),
                );
                ResolveAction::Retry(candidate)
            } else {
                log_line(
                    app,
                    "error",
                    format!("resolve failed for {pano}: {outcome}"),
                );
                ResolveAction::Continue
            }
        }
        outcome @ (ResolveOutcome::InvalidResponse | ResolveOutcome::CdpError(_)) => {
            log_line(
                app,
                "error",
                format!("resolve failed for {pano}: {outcome}"),
            );
            ResolveAction::Continue
        }
    }
}

async fn prewarm_google_maps(conn: Arc<Conn>, app: AppHandle) {
    let script =
        r#"Boolean(window.google && window.google.maps && window.google.maps.StreetViewService)"#;
    for attempt in 1..=6 {
        let ready = tokio::time::timeout(
            Duration::from_millis(750),
            conn.call(
                "Runtime.evaluate",
                json!({
                    "expression": script,
                    "returnByValue": true,
                }),
            ),
        )
        .await
        .ok()
        .and_then(Result::ok)
        .and_then(|v| {
            v.get("result")
                .and_then(|r| r.get("value"))
                .and_then(|v| v.as_bool())
        })
        .unwrap_or(false);

        if ready {
            log_line(&app, "info", "Google Maps resolver prewarmed");
            return;
        }

        if attempt < 6 {
            tokio::time::sleep(Duration::from_millis(150)).await;
        }
    }
}

async fn resolve_candidate(conn: Arc<Conn>, candidate: PanoCandidate) -> ResolvedCandidate {
    let outcome = resolve_pano(&conn, &candidate.pano).await;
    ResolvedCandidate { candidate, outcome }
}

#[derive(Debug)]
enum ResolveOutcome {
    Resolved { lat: f64, lng: f64 },
    NotFound,
    GoogleNotReady,
    Timeout,
    InvalidResponse,
    Transient(String),
    CdpError(String),
}

impl std::fmt::Display for ResolveOutcome {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Resolved { .. } => f.write_str("resolved"),
            Self::NotFound => f.write_str("not found"),
            Self::GoogleNotReady => f.write_str("Google Maps not ready"),
            Self::Timeout => f.write_str("timeout"),
            Self::InvalidResponse => f.write_str("invalid response"),
            Self::Transient(e) => write!(f, "transient error: {e}"),
            Self::CdpError(e) => write!(f, "CDP error: {e}"),
        }
    }
}

fn is_maps_rpc_url(url: &str) -> bool {
    url.contains("maps.googleapis.com/$rpc")
        || (url.contains("maps.googleapis.com") && url.contains("$rpc"))
}

async fn fetch_body(conn: &Conn, request_id: &str) -> Result<String> {
    let v = conn
        .call(
            "Network.getResponseBody",
            json!({ "requestId": request_id }),
        )
        .await?;
    let body = v
        .get("body")
        .and_then(|b| b.as_str())
        .ok_or_else(|| anyhow::anyhow!("empty body"))?;
    let base64 = v
        .get("base64Encoded")
        .and_then(|b| b.as_bool())
        .unwrap_or(false);

    if base64 {
        let bytes = base64::engine::general_purpose::STANDARD.decode(body)?;
        Ok(String::from_utf8_lossy(&bytes).into_owned())
    } else {
        Ok(body.to_string())
    }
}

async fn resolve_pano(conn: &Conn, pano: &str) -> ResolveOutcome {
    let script = resolver::build_script(pano);
    let res = match tokio::time::timeout(
        RESOLVE_TIMEOUT,
        conn.call(
            "Runtime.evaluate",
            json!({
                "expression": script,
                "returnByValue": true,
                "awaitPromise": true,
            }),
        ),
    )
    .await
    {
        Ok(Ok(res)) => res,
        Ok(Err(e)) => return ResolveOutcome::CdpError(e.to_string()),
        Err(_) => return ResolveOutcome::Timeout,
    };

    let raw = res
        .get("result")
        .and_then(|r| r.get("value"))
        .and_then(|v| v.as_str())
        .unwrap_or("");

    match resolver::parse(raw) {
        resolver::ResolverOutcome::Resolved { lat, lng } => ResolveOutcome::Resolved { lat, lng },
        resolver::ResolverOutcome::NotFound => ResolveOutcome::NotFound,
        resolver::ResolverOutcome::GoogleNotReady => ResolveOutcome::GoogleNotReady,
        resolver::ResolverOutcome::Timeout => ResolveOutcome::Timeout,
        resolver::ResolverOutcome::InvalidResponse => ResolveOutcome::InvalidResponse,
        resolver::ResolverOutcome::Transient(error) => ResolveOutcome::Transient(error),
        resolver::ResolverOutcome::Error(error) => ResolveOutcome::CdpError(error),
    }
}

fn try_update(
    state: &Shared,
    app: &AppHandle,
    emitted_panos: &mut LimitedSet<String>,
    candidate: &PanoCandidate,
    lat: f64,
    lng: f64,
) -> bool {
    let pano = &candidate.pano;
    let source = "rpc-xhr";
    if !is_valid(lat, lng) {
        return false;
    }
    if emitted_panos.contains(pano) {
        return false;
    }
    if let Some(distance) = state.position_delta_meters(lat, lng) {
        log_line(
            app,
            "info",
            format!("accepted pano {pano}: {distance:.1}m from previous coords"),
        );
    }
    let coords = Coords {
        lat,
        lng,
        source: source.to_string(),
        timestamp: now_ms(),
    };
    let round = state.set_current(coords.clone());
    emitted_panos.insert(pano.to_string());

    let _ = app.emit("coords", &coords);
    let _ = app.emit("round", &round);
    log_line(app, "coords", format!("{:.6}, {:.6} [{source}]", lat, lng));
    true
}

fn emit_status(app: &AppHandle, state: &Shared) {
    let _ = app.emit("state", &state.snapshot());
}

fn log_line(app: &AppHandle, level: &str, text: impl Into<String>) {
    let text = text.into();
    println!("[{level}] {text}");
    let _ = app.emit(
        "log",
        json!({ "level": level, "text": text, "ts": now_ms() }),
    );
}

fn now_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as u64)
        .unwrap_or(0)
}
