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
    reconnect_epoch: std::sync::atomic::AtomicU64,
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
            reconnect_epoch: std::sync::atomic::AtomicU64::new(0),
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

    pub fn position_delta_meters(&self, lat: f64, lng: f64) -> Option<f64> {
        let g = self.inner.lock();
        g.current
            .as_ref()
            .map(|c| distance_meters(c.lat, c.lng, lat, lng))
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

    pub fn reconnect(&self) {
        self.reconnect_epoch
            .fetch_add(1, std::sync::atomic::Ordering::Relaxed);
        self.kick.notify_waiters();
    }

    pub fn reconnect_epoch(&self) -> u64 {
        self.reconnect_epoch
            .load(std::sync::atomic::Ordering::Relaxed)
    }
}

fn distance_meters(a_lat: f64, a_lng: f64, b_lat: f64, b_lng: f64) -> f64 {
    const EARTH_RADIUS_M: f64 = 6_371_000.0;
    let d_lat = (b_lat - a_lat).to_radians();
    let d_lng = (b_lng - a_lng).to_radians();
    let a_lat = a_lat.to_radians();
    let b_lat = b_lat.to_radians();
    let h = (d_lat / 2.0).sin().powi(2) + a_lat.cos() * b_lat.cos() * (d_lng / 2.0).sin().powi(2);
    2.0 * EARTH_RADIUS_M * h.sqrt().asin()
}
