use std::sync::Mutex;
use std::time::{Duration, Instant};

use once_cell::sync::Lazy;
use serde::Deserialize;
use thiserror::Error;

const LAUNCH_FLAGS: &str = "--remote-debugging-port=34788";
const LAUNCH_PROBE_TTL: Duration = Duration::from_secs(10);

#[derive(Debug, Error)]
pub enum TargetError {
    #[error("{diagnostic}")]
    PortUnavailable {
        diagnostic: String,
        #[source]
        source: reqwest::Error,
    },
    #[error("GeoGuessr is not active. Start GeoGuessr on Steam or open a game round.")]
    GeoGuessrNotActive,
    #[error("CDP target list is invalid: {0}")]
    InvalidTargetList(#[from] reqwest::Error),
    #[error("CDP WebSocket target is invalid: {0}")]
    InvalidWebSocketTarget(String),
    #[error("missing --remote-allow-origins=*")]
    MissingAllowOrigins,
}

#[derive(Debug, Deserialize)]
pub struct Target {
    #[serde(default)]
    pub r#type: String,
    #[serde(default)]
    pub url: String,
    #[serde(default)]
    pub title: String,
    #[serde(default, rename = "webSocketDebuggerUrl")]
    pub ws_url: String,
}

pub async fn find() -> Result<Target, TargetError> {
    // Detect dynamic remote debugging port from running process
    let launch_opts = cached_launch_options().await;
    let port_str = match &launch_opts {
        LaunchOptions::DetectedOtherPort(p) => p.as_str(),
        _ => "34788",
    };
    let port_num: u16 = port_str.parse().unwrap_or(34788);

    let cdp_url = format!("http://localhost:{}/json", port_str);

    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(4))
        .build()
        .map_err(TargetError::InvalidTargetList)?;

    let res = match client.get(&cdp_url).send().await {
        Ok(res) => res,
        Err(source) => {
            return Err(TargetError::PortUnavailable {
                diagnostic: launch_diagnostic().await,
                source,
            });
        }
    };
    let text = match res.text().await {
        Ok(t) => t,
        Err(e) => return Err(TargetError::InvalidTargetList(e)),
    };

    // Newer Electron/Chromium versions return a plain-text error when
    // --remote-allow-origins=* is missing instead of the JSON target list.
    if text.contains("WebSockets request was expected") || text.contains("400 Bad Request") {
        return Err(TargetError::MissingAllowOrigins);
    }

    let targets: Vec<Target> = match serde_json::from_str(&text) {
        Ok(v) => v,
        Err(_) => return Err(TargetError::MissingAllowOrigins),
    };

    let game_iframe = targets
        .iter()
        .find(|t| t.r#type == "iframe" && is_geoguessr(t) && looks_like_game(t));
    let game_page = targets
        .iter()
        .find(|t| t.r#type == "page" && is_geoguessr(t) && looks_like_game(t));
    let any_iframe = targets
        .iter()
        .find(|t| t.r#type == "iframe" && is_geoguessr(t));
    let any_page = targets
        .iter()
        .find(|t| t.r#type == "page" && is_geoguessr(t));

    let picked = game_iframe
        .or(game_page)
        .or(any_iframe)
        .or(any_page)
        .ok_or(TargetError::GeoGuessrNotActive)?;
    let ws_url = validate_ws_url(&picked.ws_url, port_num)?;

    Ok(Target {
        r#type: picked.r#type.clone(),
        url: picked.url.clone(),
        title: picked.title.clone(),
        ws_url,
    })
}

fn is_geoguessr(t: &Target) -> bool {
    if t.ws_url.is_empty() {
        return false;
    }
    t.url.contains("geoguessr.com") || t.title.contains("GeoGuessr")
}

fn looks_like_game(t: &Target) -> bool {
    let u = t.url.to_lowercase();
    u.contains("/game")
        || u.contains("/duels")
        || u.contains("/battle")
        || u.contains("/challenge")
        || u.contains("/quiz")
        || u.contains("/play")
}

fn validate_ws_url(raw: &str, expected_port: u16) -> Result<String, TargetError> {
    let url =
        reqwest::Url::parse(raw).map_err(|e| TargetError::InvalidWebSocketTarget(e.to_string()))?;

    match url.scheme() {
        "ws" | "wss" => {}
        _ => {
            return Err(TargetError::InvalidWebSocketTarget(
                "expected ws:// or wss:// scheme".into(),
            ));
        }
    }

    match url.host_str() {
        Some("localhost") | Some("127.0.0.1") | Some("[::1]") | Some("::1") => {}
        _ => {
            return Err(TargetError::InvalidWebSocketTarget(
                "expected a loopback DevTools host".into(),
            ));
        }
    }

    if url.port_or_known_default() != Some(expected_port) {
        return Err(TargetError::InvalidWebSocketTarget(
            format!("expected DevTools port {expected_port}").into(),
        ));
    }

    if !url.path().starts_with("/devtools/") {
        return Err(TargetError::InvalidWebSocketTarget(
            "expected a DevTools WebSocket path".into(),
        ));
    }

    if !url.username().is_empty()
        || url.password().is_some()
        || url.query().is_some()
        || url.fragment().is_some()
    {
        return Err(TargetError::InvalidWebSocketTarget(
            "unexpected credentials or URL components".into(),
        ));
    }

    Ok(raw.to_string())
}

async fn launch_diagnostic() -> String {
    match cached_launch_options().await {
        LaunchOptions::DetectedWithPort => {
            "CDP port is not reachable, but GeoGuessr has the 34788 launch flag. Restart GeoGuessr or check whether another process owns the port.".into()
        }
        LaunchOptions::DetectedWithoutPort => {
            format!("CDP port is not reachable. GeoGuessr is running without the required Steam launch options: {LAUNCH_FLAGS}")
        }
        LaunchOptions::DetectedOtherPort(port) => {
            format!("CDP port 34788 is not reachable. GeoGuessr is running with remote debugging port {port}; use {LAUNCH_FLAGS} or make the app configurable.")
        }
        LaunchOptions::NotRunning => {
            format!("CDP port is not reachable and GeoGuessr.exe is not running. Start GeoGuessr with Steam launch options: {LAUNCH_FLAGS}")
        }
        LaunchOptions::Unknown => {
            format!("CDP port is not reachable. Add Steam launch options: {LAUNCH_FLAGS}")
        }
    }
}

#[derive(Clone)]
enum LaunchOptions {
    DetectedWithPort,
    DetectedWithoutPort,
    DetectedOtherPort(String),
    NotRunning,
    Unknown,
}

static LAUNCH_PROBE_CACHE: Lazy<Mutex<Option<(Instant, LaunchOptions)>>> =
    Lazy::new(|| Mutex::new(None));

async fn cached_launch_options() -> LaunchOptions {
    if let Some((at, opts)) = LAUNCH_PROBE_CACHE.lock().ok().and_then(|g| g.clone()) {
        if at.elapsed() < LAUNCH_PROBE_TTL {
            return opts;
        }
    }

    let opts = tokio::task::spawn_blocking(detect_launch_options)
        .await
        .unwrap_or(LaunchOptions::Unknown);

    if let Ok(mut guard) = LAUNCH_PROBE_CACHE.lock() {
        *guard = Some((Instant::now(), opts.clone()));
    }
    opts
}

fn detect_launch_options() -> LaunchOptions {
    use sysinfo::{ProcessRefreshKind, RefreshKind, System, UpdateKind};

    let mut sys = System::new_with_specifics(
        RefreshKind::new().with_processes(ProcessRefreshKind::new().with_cmd(UpdateKind::Always)),
    );
    sys.refresh_processes(sysinfo::ProcessesToUpdate::All, true);

    let mut command_lines: Vec<String> = Vec::new();
    for process in sys.processes().values() {
        let name = process.name().to_string_lossy().to_lowercase();
        if !name.starts_with("geoguessr") {
            continue;
        }
        let cmd = process
            .cmd()
            .iter()
            .map(|s| s.to_string_lossy().into_owned())
            .collect::<Vec<_>>()
            .join(" ");
        if !cmd.trim().is_empty() {
            command_lines.push(cmd);
        }
    }

    if command_lines.is_empty() {
        return LaunchOptions::NotRunning;
    }
    if command_lines
        .iter()
        .any(|line| line.contains("--remote-debugging-port=34788"))
    {
        return LaunchOptions::DetectedWithPort;
    }
    if let Some(port) = command_lines
        .iter()
        .find_map(|line| remote_debugging_port(line))
    {
        return LaunchOptions::DetectedOtherPort(port);
    }

    LaunchOptions::DetectedWithoutPort
}

fn remote_debugging_port(command_line: &str) -> Option<String> {
    let marker = "--remote-debugging-port=";
    let start = command_line.find(marker)? + marker.len();
    let port = command_line[start..]
        .split_whitespace()
        .next()
        .unwrap_or("")
        .trim_matches('"');
    if port.is_empty() {
        None
    } else {
        Some(port.to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::{validate_ws_url, TargetError};

    #[test]
    fn accepts_loopback_devtools_target_on_expected_port() {
        let raw = "ws://127.0.0.1:34788/devtools/page/ABC";
        assert_eq!(validate_ws_url(raw, 34788).unwrap(), raw);
    }

    #[test]
    fn rejects_alternate_websocket_port() {
        assert!(matches!(
            validate_ws_url("ws://127.0.0.1:9876/devtools/page/ABC", 34788),
            Err(TargetError::InvalidWebSocketTarget(_))
        ));
    }

    #[test]
    fn rejects_non_devtools_path() {
        assert!(matches!(
            validate_ws_url("ws://127.0.0.1:34788/attacker-controlled", 34788),
            Err(TargetError::InvalidWebSocketTarget(_))
        ));
    }

    #[test]
    fn rejects_non_loopback_host() {
        assert!(matches!(
            validate_ws_url("ws://example.com:34788/devtools/page/ABC", 34788),
            Err(TargetError::InvalidWebSocketTarget(_))
        ));
    }
}
