mod conn;
mod pipeline;
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

use conn::Conn;
use pipeline::{
    PanoCandidate, PanoIngest, ResolveAction, ResolveOutcome, ResolveWork, ResolvedCandidate,
    RoundPipeline,
};

const BURST_DEBOUNCE: Duration = Duration::from_millis(10);
const RESOLVE_TIMEOUT: Duration = Duration::from_secs(3);
const RETRY_MIN: Duration = Duration::from_secs(1);
const RETRY_MAX: Duration = Duration::from_secs(30);
const MAX_CONCURRENT_RESOLVES: usize = 4;

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
    let mut pipeline = RoundPipeline::new();
    let mut pending_resolves = FuturesUnordered::<BoxFuture<'static, ResolvedCandidate>>::new();

    let far_future = Instant::now() + Duration::from_secs(60 * 60);
    let mut burst_deadline = far_future;

    loop {
        while pending_resolves.len() < MAX_CONCURRENT_RESOLVES {
            let Some(work) = pipeline.next_work() else {
                break;
            };

            match work {
                ResolveWork::Cached {
                    candidate,
                    lat,
                    lng,
                } => {
                    if try_update(&state, &app, &candidate, lat, lng) {
                        pipeline.record_accepted(&candidate.pano);
                        pending_resolves.clear();
                    }
                }
                ResolveWork::Resolve(candidate) => {
                    pending_resolves.push(resolve_candidate(conn.clone(), candidate).boxed());
                }
            }
        }

        let burst_active = pipeline.has_burst();
        let resolving = !pending_resolves.is_empty();

        tokio::select! {
            evt = events.recv() => {
                let Some(evt) = evt else { return Ok(ControllerEnd::Ended); };
                match evt {
                    NetworkEvent::Response { request_id, url } => {
                        if is_maps_rpc_url(&url) {
                            pipeline.remember_rpc_response(request_id);
                        }
                    }
                    NetworkEvent::LoadingFailed { request_id } => {
                        pipeline.forget_rpc_request(&request_id);
                    }
                    NetworkEvent::LoadingFinished { request_id } => {
                        if !pipeline.take_rpc_request(&request_id) { continue; }
                        if let Ok(text) = fetch_body(&conn, &request_id).await {
                            match pipeline.ingest_panos(
                                request_id,
                                rpc::extract_panos(&text),
                                Instant::now(),
                            ) {
                                PanoIngest::Ignored => {}
                                PanoIngest::Queued => {
                                    burst_deadline = Instant::now() + BURST_DEBOUNCE;
                                }
                                PanoIngest::UnlockedAndQueued => {
                                    pending_resolves.clear();
                                    log_line(&app, "info", "new pano burst after idle; resolver unlocked");
                                    burst_deadline = Instant::now() + BURST_DEBOUNCE;
                                }
                            }
                        }
                    }
                }
            }

            _ = tokio::time::sleep_until(burst_deadline.into()), if burst_active => {
                pipeline.drain_burst_to_batch();
                burst_deadline = far_future;
            }

            resolved = pending_resolves.next(), if resolving => {
                let Some(resolved) = resolved else { continue; };
                let (action, log) = pipeline.record_resolution(resolved);
                if let Some(message) = log {
                    let level = if message.starts_with("retrying ") { "info" } else { "error" };
                    log_line(&app, level, message);
                }
                match action {
                    ResolveAction::TryAccept { candidate, lat, lng } => {
                        if try_update(&state, &app, &candidate, lat, lng) {
                            pipeline.record_accepted(&candidate.pano);
                            pending_resolves.clear();
                        }
                    }
                    ResolveAction::Retry(candidate) => {
                        pending_resolves.push(resolve_candidate(conn.clone(), candidate).boxed());
                    }
                    ResolveAction::Continue => {}
                }
            }

            _ = wait_for_reconnect(state.clone(), reconnect_epoch) => {
                pipeline.clear_for_reconnect();
                pending_resolves.clear();
                log_line(&app, "info", "Reconnect requested; cleared pending CDP work");
                return Ok(ControllerEnd::ReconnectRequested);
            }
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
    candidate: &PanoCandidate,
    lat: f64,
    lng: f64,
) -> bool {
    let pano = &candidate.pano;
    let source = "rpc-xhr";
    if !is_valid(lat, lng) {
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
