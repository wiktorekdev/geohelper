use once_cell::sync::Lazy;
use regex::Regex;
use std::collections::HashSet;

static PANO_RE: Lazy<Regex> =
    Lazy::new(|| Regex::new(r#"\[2,"([A-Za-z0-9_\-]{20,30})"\]"#).unwrap());

pub fn extract_panos(text: &str) -> Vec<String> {
    let mut seen = HashSet::new();
    let mut out = Vec::new();
    for cap in PANO_RE.captures_iter(text) {
        let id = cap.get(1).unwrap().as_str().to_string();
        if seen.insert(id.clone()) {
            out.push(id);
        }
    }
    out
}
