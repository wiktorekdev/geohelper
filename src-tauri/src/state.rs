use std::sync::Arc;

use parking_lot::Mutex;
use serde::{Deserialize, Serialize};
use tokio::sync::Notify;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Coords {
    pub lat: f64,
    pub lng: f64,
    pub source: String,
    pub timestamp: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Round {
    pub index: u32,
    pub coords: Coords,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "lowercase")]
pub enum ConnState {
    Idle,
    Searching,
    Connected,
    Disconnected { reason: String },
}

#[derive(Debug, Clone, Serialize)]
pub struct Snapshot {
    pub conn: ConnState,
    pub current: Option<Coords>,
    pub history: Vec<Round>,
}

pub struct State {
    inner: Mutex<Inner>,
    pub kick: Notify,
}

struct Inner {
    conn: ConnState,
    current: Option<Coords>,
    history: Vec<Round>,
    round_counter: u32,
}

pub type Shared = Arc<State>;

impl State {
    pub fn new() -> Shared {
        Arc::new(Self {
            inner: Mutex::new(Inner {
                conn: ConnState::Idle,
                current: None,
                history: Vec::new(),
                round_counter: 0,
            }),
            kick: Notify::new(),
        })
    }

    pub fn snapshot(&self) -> Snapshot {
        let g = self.inner.lock();
        Snapshot {
            conn: g.conn.clone(),
            current: g.current.clone(),
            history: g.history.clone(),
        }
    }

    pub fn set_conn(&self, conn: ConnState) {
        self.inner.lock().conn = conn;
    }

    pub fn set_current(&self, coords: Coords) -> Round {
        let mut g = self.inner.lock();
        g.round_counter += 1;
        let round = Round {
            index: g.round_counter,
            coords: coords.clone(),
        };
        g.current = Some(coords);
        g.history.push(round.clone());
        if g.history.len() > 500 {
            let drop = g.history.len() - 500;
            g.history.drain(0..drop);
        }
        round
    }

    pub fn reset(&self) {
        self.inner.lock().current = None;
    }

    pub fn clear_history(&self) {
        let mut g = self.inner.lock();
        g.history.clear();
        g.round_counter = 0;
        g.current = None;
    }
}
