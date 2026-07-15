use anyhow::Result;
use base64::Engine;
use serde_json::{json, Value};

use super::conn::Conn;

#[derive(Debug)]
pub(super) enum NetworkEvent {
    Response { request_id: String, url: String },
    LoadingFinished { request_id: String },
    LoadingFailed { request_id: String },
}

pub(super) fn parse_event(method: &str, value: &Value) -> Option<NetworkEvent> {
    let params = value.get("params")?;
    let request_id = params.get("requestId")?.as_str()?.to_string();
    match method {
        "Network.responseReceived" => {
            let url = params
                .get("response")
                .and_then(|response| response.get("url"))
                .and_then(|url| url.as_str())
                .unwrap_or("")
                .to_string();
            Some(NetworkEvent::Response { request_id, url })
        }
        "Network.loadingFinished" => Some(NetworkEvent::LoadingFinished { request_id }),
        "Network.loadingFailed" => Some(NetworkEvent::LoadingFailed { request_id }),
        _ => None,
    }
}

pub(super) fn is_maps_rpc_url(url: &str) -> bool {
    url.contains("maps.googleapis.com/$rpc")
        || (url.contains("maps.googleapis.com") && url.contains("$rpc"))
}

pub(super) async fn fetch_body(conn: &Conn, request_id: &str) -> Result<String> {
    let value = conn
        .call(
            "Network.getResponseBody",
            json!({ "requestId": request_id }),
        )
        .await?;
    let body = value
        .get("body")
        .and_then(|body| body.as_str())
        .ok_or_else(|| anyhow::anyhow!("empty body"))?;
    let base64_encoded = value
        .get("base64Encoded")
        .and_then(|encoded| encoded.as_bool())
        .unwrap_or(false);

    if base64_encoded {
        let bytes = base64::engine::general_purpose::STANDARD.decode(body)?;
        Ok(String::from_utf8_lossy(&bytes).into_owned())
    } else {
        Ok(body.to_string())
    }
}

#[cfg(test)]
mod tests {
    use serde_json::json;

    use super::{is_maps_rpc_url, parse_event, NetworkEvent};

    #[test]
    fn parses_supported_network_events() {
        let value = json!({
            "params": {
                "requestId": "request-1",
                "response": { "url": "https://maps.googleapis.com/$rpc/example" }
            }
        });
        assert!(matches!(
            parse_event("Network.responseReceived", &value),
            Some(NetworkEvent::Response { request_id, url })
                if request_id == "request-1" && is_maps_rpc_url(&url)
        ));
    }

    #[test]
    fn rejects_unrelated_urls() {
        assert!(!is_maps_rpc_url("https://example.com/api"));
    }
}
