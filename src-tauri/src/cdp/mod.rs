mod conn;
mod resolver;
mod rpc;
mod target;

use std::sync::Arc;
use std::time::{Duration, Instant, SystemTime, UNIX_EPOCH};

use anyhow::Result;
use base64::Engine;
use futures_util::StreamExt;
use serde_json::{json, Value};
use tauri::{AppHandle, Emitter};
use tokio::sync::mpsc;
use tokio_tungstenite::connect_async;
use tokio_tungstenite::tungstenite::Message;

use crate::geo::is_valid;
use crate::state::{ConnState, Coords, Shared};
use crate::util::{LimitedMap, LimitedSet};

use conn::Conn;

const BURST_DEBOUNCE: Duration = Duration::from_millis(300);
const RESOLVE_INTERVAL: Duration = Duration::from_millis(600);
const MAX_BATCH: usize = 10;
const MAX_REMEMBERED: usize = 1000;

pub async fn run(app: AppHandle, state: Shared) {
    loop {
        state.set_conn(ConnState::Searching);
        emit_status(&app, &state);

        if let Err(e) = attempt(&app, &state).await {
            eprintln!("[cdp] {e}");
            log_line(&app, "error", format!("{e}"));
            state.set_conn(ConnState::Disconnected {
                reason: format!("{e}"),
            });
            emit_status(&app, &state);
        }

        tokio::select! {
            _ = tokio::time::sleep(Duration::from_secs(3)) => {}
            _ = state.kick.notified() => {}
        }
    }
}

async fn attempt(app: &AppHandle, state: &Shared) -> Result<()> {
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

    let (evt_tx, evt_rx) = mpsc::channel::<NetworkEvent>(256);
    let (close_tx, mut close_rx) = mpsc::channel::<()>(1);

    let conn_clone = conn.clone();
    let reader = tokio::spawn(async move {
        while let Some(msg) = read.next().await {
            let Ok(msg) = msg else { break };
            let Message::Text(text) = msg else { continue };
            let v: Value = match serde_json::from_str(&text) {
                Ok(v) => v,
                Err(_) => continue,
            };

            if let Some(id) = v.get("id").and_then(|i| i.as_u64()) {
                conn_clone.resolve(id, v);
            } else if let Some(method) = v.get("method").and_then(|m| m.as_str()) {
                if let Some(evt) = parse_event(method, &v) {
                    if evt_tx.send(evt).await.is_err() {
                        break;
                    }
                }
            }
        }
        let _ = close_tx.send(()).await;
    });

    state.set_conn(ConnState::Connected);
    emit_status(app, state);
    log_line(app, "success", "CDP connected");

    conn.call("Network.enable", json!({})).await?;

    let result = tokio::select! {
        res = controller(app.clone(), state.clone(), conn.clone(), evt_rx) => res,
        _ = close_rx.recv() => Err(anyhow::anyhow!("WebSocket closed")),
    };

    reader.abort();
    result
}

#[derive(Debug)]
enum NetworkEvent {
    Response { request_id: String, url: String },
    LoadingFinished { request_id: String },
    LoadingFailed { request_id: String },
}

#[derive(Debug, Clone)]
struct PanoCandidate {
    request_id: String,
    pano: String,
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
    conn: Arc<Conn>,
    mut events: mpsc::Receiver<NetworkEvent>,
) -> Result<()> {
    let mut rpc_requests: std::collections::HashSet<String> = Default::default();
    let mut burst: Vec<PanoCandidate> = Vec::new();
    let mut burst_seen: std::collections::HashSet<String> = Default::default();
    let mut batch: std::collections::VecDeque<PanoCandidate> = Default::default();
    let mut zero_results = LimitedSet::<String>::new(MAX_REMEMBERED);
    let mut resolved_cache = LimitedMap::<String, (f64, f64)>::new(MAX_REMEMBERED);
    let mut emitted_panos = LimitedSet::<String>::new(MAX_REMEMBERED);

    let far_future = Instant::now() + Duration::from_secs(60 * 60);
    let mut burst_deadline = far_future;
    let mut next_resolve = Instant::now();

    loop {
        let burst_active = !burst.is_empty();
        let batch_active = !batch.is_empty();

        tokio::select! {
            evt = events.recv() => {
                let Some(evt) = evt else { return Ok(()); };
                match evt {
                    NetworkEvent::Response { request_id, url } => {
                        if url.contains("maps.googleapis.com/$rpc") {
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
                            for pano in panos {
                                if burst.len() >= MAX_BATCH { break; }
                                let candidate = PanoCandidate {
                                    request_id: request_id.clone(),
                                    pano,
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

            _ = tokio::time::sleep_until(next_resolve.into()), if batch_active => {
                let candidate = batch.pop_front().unwrap();
                next_resolve = Instant::now() + RESOLVE_INTERVAL;

                let pano = candidate.pano;
                if zero_results.contains(&pano) { continue; }
                if emitted_panos.contains(&pano) { continue; }

                if let Some(cached) = resolved_cache.get(&pano) {
                    if try_update(&state, &app, &mut emitted_panos, &pano, cached.0, cached.1, "rpc-cached") {
                        batch.clear();
                    }
                    continue;
                }

                match resolve_pano(&conn, &pano).await {
                    Ok(Some((lat, lng))) => {
                        resolved_cache.insert(pano.clone(), (lat, lng));
                        if try_update(&state, &app, &mut emitted_panos, &pano, lat, lng, "rpc-xhr") {
                            batch.clear();
                        }
                    }
                    Ok(None) => {
                        zero_results.insert(pano);
                    }
                    Err(e) => {
                        log_line(&app, "error", format!("resolve failed: {e}"));
                    }
                }
            }
        }
    }
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

async fn resolve_pano(conn: &Conn, pano: &str) -> Result<Option<(f64, f64)>> {
    let script = resolver::build_script(pano);
    let res = conn
        .call(
            "Runtime.evaluate",
            json!({
                "expression": script,
                "returnByValue": true,
                "awaitPromise": true,
            }),
        )
        .await?;

    let raw = res
        .get("result")
        .and_then(|r| r.get("value"))
        .and_then(|v| v.as_str())
        .unwrap_or("");

    match resolver::parse(raw) {
        resolver::Resolved::Ok { lat, lng, .. } => Ok(Some((lat, lng))),
        resolver::Resolved::Err { error } => {
            if error == "ZERO_RESULTS" || error == "NOT_FOUND" {
                Ok(None)
            } else {
                Err(anyhow::anyhow!(error))
            }
        }
    }
}

fn try_update(
    state: &Shared,
    app: &AppHandle,
    emitted_panos: &mut LimitedSet<String>,
    pano: &str,
    lat: f64,
    lng: f64,
    source: &str,
) -> bool {
    if !is_valid(lat, lng) {
        return false;
    }
    if emitted_panos.contains(pano) {
        return false;
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
