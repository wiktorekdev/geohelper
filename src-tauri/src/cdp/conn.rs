use std::collections::HashMap;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;
use std::time::Duration;

use anyhow::{anyhow, Result};
use futures_util::stream::SplitSink;
use futures_util::SinkExt;
use parking_lot::Mutex;
use serde_json::{json, Value};
use tokio::net::TcpStream;
use tokio::sync::oneshot;
use tokio_tungstenite::tungstenite::protocol::Message;
use tokio_tungstenite::{MaybeTlsStream, WebSocketStream};

type WsWriter = SplitSink<WebSocketStream<MaybeTlsStream<TcpStream>>, Message>;

pub struct Conn {
    writer: tokio::sync::Mutex<WsWriter>,
    msg_id: AtomicU64,
    pending: Mutex<HashMap<u64, oneshot::Sender<Value>>>,
}

impl Conn {
    pub fn new(writer: WsWriter) -> Arc<Self> {
        Arc::new(Self {
            writer: tokio::sync::Mutex::new(writer),
            msg_id: AtomicU64::new(1),
            pending: Mutex::new(HashMap::new()),
        })
    }

    pub async fn call(&self, method: &str, params: Value) -> Result<Value> {
        let id = self.msg_id.fetch_add(1, Ordering::Relaxed);
        let (tx, rx) = oneshot::channel();
        self.pending.lock().insert(id, tx);

        let payload = json!({ "id": id, "method": method, "params": params });
        {
            let mut w = self.writer.lock().await;
            w.send(Message::Text(payload.to_string())).await?;
        }

        match tokio::time::timeout(Duration::from_secs(10), rx).await {
            Ok(Ok(v)) => {
                if let Some(err) = v.get("error") {
                    return Err(anyhow!("CDP error: {}", err));
                }
                Ok(v.get("result").cloned().unwrap_or(Value::Null))
            }
            Ok(Err(_)) => Err(anyhow!("CDP response channel closed")),
            Err(_) => {
                self.pending.lock().remove(&id);
                Err(anyhow!("CDP timeout: {method}"))
            }
        }
    }

    pub fn resolve(&self, id: u64, value: Value) {
        if let Some(tx) = self.pending.lock().remove(&id) {
            let _ = tx.send(value);
        }
    }
}
