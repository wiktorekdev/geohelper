use std::collections::{HashSet, VecDeque};
use std::time::{Duration, Instant};

use crate::util::{LimitedMap, LimitedSet};

const ROUND_IDLE_GAP: Duration = Duration::from_millis(250);
const MAX_BATCH: usize = 24;
const MAX_REMEMBERED: usize = 1000;
pub(super) const MAX_RESOLVE_ATTEMPTS: u8 = 3;

#[derive(Debug, Clone)]
pub(super) struct PanoCandidate {
    pub request_id: String,
    pub pano: String,
    pub attempts: u8,
}

impl PanoCandidate {
    fn key(&self) -> String {
        format!("{}:{}", self.request_id, self.pano)
    }
}

pub(super) struct ResolvedCandidate {
    pub candidate: PanoCandidate,
    pub outcome: ResolveOutcome,
}

#[derive(Debug)]
pub(super) enum ResolveOutcome {
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

pub(super) enum PanoIngest {
    Ignored,
    Queued,
    UnlockedAndQueued,
}

pub(super) enum ResolveWork {
    Cached {
        candidate: PanoCandidate,
        lat: f64,
        lng: f64,
    },
    Resolve(PanoCandidate),
}

pub(super) enum ResolveAction {
    TryAccept {
        candidate: PanoCandidate,
        lat: f64,
        lng: f64,
    },
    Retry(PanoCandidate),
    Continue,
}

pub(super) struct RoundPipeline {
    rpc_requests: HashSet<String>,
    burst: Vec<PanoCandidate>,
    burst_seen: HashSet<String>,
    batch: VecDeque<PanoCandidate>,
    zero_results: LimitedSet<String>,
    resolved_cache: LimitedMap<String, (f64, f64)>,
    emitted_panos: LimitedSet<String>,
    location_locked: bool,
    last_pano_rpc_at: Option<Instant>,
}

impl RoundPipeline {
    pub fn new() -> Self {
        Self {
            rpc_requests: Default::default(),
            burst: Vec::new(),
            burst_seen: Default::default(),
            batch: Default::default(),
            zero_results: LimitedSet::new(MAX_REMEMBERED),
            resolved_cache: LimitedMap::new(MAX_REMEMBERED),
            emitted_panos: LimitedSet::new(MAX_REMEMBERED),
            location_locked: false,
            last_pano_rpc_at: None,
        }
    }

    pub fn remember_rpc_response(&mut self, request_id: String) {
        self.rpc_requests.insert(request_id);
    }

    pub fn forget_rpc_request(&mut self, request_id: &str) {
        self.rpc_requests.remove(request_id);
    }

    pub fn take_rpc_request(&mut self, request_id: &str) -> bool {
        self.rpc_requests.remove(request_id)
    }

    pub fn ingest_panos(
        &mut self,
        request_id: String,
        panos: Vec<String>,
        now: Instant,
    ) -> PanoIngest {
        if panos.is_empty() {
            return PanoIngest::Ignored;
        }

        let mut unlocked = false;
        let round_gap = self
            .last_pano_rpc_at
            .map(|last| now.duration_since(last) >= ROUND_IDLE_GAP)
            .unwrap_or(true);
        self.last_pano_rpc_at = Some(now);

        if self.location_locked && round_gap {
            self.unlock_for_new_round();
            unlocked = true;
        }

        if self.location_locked {
            return PanoIngest::Ignored;
        }

        for pano in panos {
            if self.burst.len() >= MAX_BATCH {
                break;
            }
            if self.emitted_panos.contains(&pano) {
                continue;
            }
            let candidate = PanoCandidate {
                request_id: request_id.clone(),
                pano,
                attempts: 0,
            };
            if self.burst_seen.insert(candidate.key()) {
                self.burst.push(candidate);
            }
        }

        if self.burst.is_empty() {
            PanoIngest::Ignored
        } else if unlocked {
            PanoIngest::UnlockedAndQueued
        } else {
            PanoIngest::Queued
        }
    }

    pub fn has_burst(&self) -> bool {
        !self.burst.is_empty()
    }

    pub fn drain_burst_to_batch(&mut self) {
        let drained = std::mem::take(&mut self.burst);
        self.burst_seen.clear();
        self.batch.clear();
        self.batch.extend(drained);
    }

    pub fn next_work(&mut self) -> Option<ResolveWork> {
        loop {
            let candidate = self.batch.pop_front()?;
            let pano = candidate.pano.clone();
            if self.zero_results.contains(&pano) || self.emitted_panos.contains(&pano) {
                continue;
            }

            if let Some((lat, lng)) = self.resolved_cache.get(&pano) {
                return Some(ResolveWork::Cached {
                    candidate,
                    lat,
                    lng,
                });
            }

            return Some(ResolveWork::Resolve(candidate));
        }
    }

    pub fn record_resolution(
        &mut self,
        resolved: ResolvedCandidate,
    ) -> (ResolveAction, Option<String>) {
        let mut candidate = resolved.candidate;
        let pano = candidate.pano.clone();
        match resolved.outcome {
            ResolveOutcome::Resolved { lat, lng } => {
                self.resolved_cache.insert(pano, (lat, lng));
                (
                    ResolveAction::TryAccept {
                        candidate,
                        lat,
                        lng,
                    },
                    None,
                )
            }
            ResolveOutcome::NotFound => {
                self.zero_results.insert(pano);
                (ResolveAction::Continue, None)
            }
            outcome @ (ResolveOutcome::GoogleNotReady
            | ResolveOutcome::Timeout
            | ResolveOutcome::Transient(_)) => {
                candidate.attempts = candidate.attempts.saturating_add(1);
                if candidate.attempts < MAX_RESOLVE_ATTEMPTS {
                    let log = format!(
                        "retrying pano {} after {} (attempt {}/{})",
                        candidate.pano,
                        outcome,
                        candidate.attempts + 1,
                        MAX_RESOLVE_ATTEMPTS
                    );
                    (ResolveAction::Retry(candidate), Some(log))
                } else {
                    (
                        ResolveAction::Continue,
                        Some(format!("resolve failed for {pano}: {outcome}")),
                    )
                }
            }
            outcome @ (ResolveOutcome::InvalidResponse | ResolveOutcome::CdpError(_)) => (
                ResolveAction::Continue,
                Some(format!("resolve failed for {pano}: {outcome}")),
            ),
        }
    }

    pub fn record_accepted(&mut self, pano: &str) {
        self.emitted_panos.insert(pano.to_string());
        self.location_locked = true;
        self.batch.clear();
    }

    pub fn clear_for_reconnect(&mut self) {
        self.rpc_requests.clear();
        self.burst.clear();
        self.burst_seen.clear();
        self.batch.clear();
    }

    fn unlock_for_new_round(&mut self) {
        self.location_locked = false;
        self.burst.clear();
        self.burst_seen.clear();
        self.batch.clear();
        self.emitted_panos.clear();
    }
}

#[cfg(test)]
mod tests {
    use super::{
        PanoIngest, ResolveAction, ResolveOutcome, ResolveWork, ResolvedCandidate, RoundPipeline,
    };
    use std::time::{Duration, Instant};

    #[test]
    fn queues_unique_panos_per_request() {
        let mut pipeline = RoundPipeline::new();
        let now = Instant::now();

        assert!(matches!(
            pipeline.ingest_panos(
                "r1".into(),
                vec!["pano-a".into(), "pano-a".into(), "pano-b".into()],
                now
            ),
            PanoIngest::Queued
        ));
        pipeline.drain_burst_to_batch();

        let first = match pipeline.next_work().unwrap() {
            ResolveWork::Resolve(candidate) => candidate.pano,
            ResolveWork::Cached { .. } => panic!("unexpected cached work"),
        };
        let second = match pipeline.next_work().unwrap() {
            ResolveWork::Resolve(candidate) => candidate.pano,
            ResolveWork::Cached { .. } => panic!("unexpected cached work"),
        };

        assert_eq!((first.as_str(), second.as_str()), ("pano-a", "pano-b"));
        assert!(pipeline.next_work().is_none());
    }

    #[test]
    fn keeps_locked_until_idle_gap_starts_next_round() {
        let mut pipeline = RoundPipeline::new();
        let now = Instant::now();

        pipeline.ingest_panos("r1".into(), vec!["pano-a".into()], now);
        pipeline.drain_burst_to_batch();
        let candidate = match pipeline.next_work().unwrap() {
            ResolveWork::Resolve(candidate) => candidate,
            ResolveWork::Cached { .. } => panic!("unexpected cached work"),
        };
        pipeline.record_accepted(&candidate.pano);

        assert!(matches!(
            pipeline.ingest_panos(
                "r2".into(),
                vec!["pano-b".into()],
                now + Duration::from_millis(50)
            ),
            PanoIngest::Ignored
        ));
        assert!(matches!(
            pipeline.ingest_panos(
                "r3".into(),
                vec!["pano-c".into()],
                now + Duration::from_millis(300)
            ),
            PanoIngest::UnlockedAndQueued
        ));
    }

    #[test]
    fn retries_transient_resolution_until_attempt_limit() {
        let mut pipeline = RoundPipeline::new();
        let candidate = super::PanoCandidate {
            request_id: "r1".into(),
            pano: "pano-a".into(),
            attempts: 0,
        };

        let (action, log) = pipeline.record_resolution(ResolvedCandidate {
            candidate,
            outcome: ResolveOutcome::Timeout,
        });
        assert!(matches!(action, ResolveAction::Retry(_)));
        assert!(log.unwrap().contains("attempt 2/3"));
    }
}
