use std::sync::Arc;
use std::time::Duration;

use serde_json::json;

use super::conn::Conn;
use super::pipeline::{PanoCandidate, ResolveOutcome, ResolvedCandidate};
use super::resolver;

const RESOLVE_TIMEOUT: Duration = Duration::from_secs(3);

pub(super) async fn prewarm_google_maps(conn: Arc<Conn>) -> bool {
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
        .and_then(|value| {
            value
                .get("result")
                .and_then(|result| result.get("value"))
                .and_then(|value| value.as_bool())
        })
        .unwrap_or(false);

        if ready {
            return true;
        }
        if attempt < 6 {
            tokio::time::sleep(Duration::from_millis(150)).await;
        }
    }
    false
}

pub(super) async fn resolve_candidate(
    conn: Arc<Conn>,
    candidate: PanoCandidate,
) -> ResolvedCandidate {
    let outcome = resolve_pano(&conn, &candidate.pano).await;
    ResolvedCandidate { candidate, outcome }
}

async fn resolve_pano(conn: &Conn, pano: &str) -> ResolveOutcome {
    let script = resolver::build_script(pano);
    let response = match tokio::time::timeout(
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
        Ok(Ok(response)) => response,
        Ok(Err(error)) => return ResolveOutcome::CdpError(error.to_string()),
        Err(_) => return ResolveOutcome::Timeout,
    };

    let raw = response
        .get("result")
        .and_then(|result| result.get("value"))
        .and_then(|value| value.as_str())
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
