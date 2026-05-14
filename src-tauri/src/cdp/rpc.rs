use once_cell::sync::Lazy;
use regex::Regex;
use std::collections::HashSet;

const PANO_ID: &str = r#"[A-Za-z0-9_:-]{16,96}"#;

static PANO_RES: Lazy<Vec<Regex>> = Lazy::new(|| {
    [
        format!(r#"\[2,\s*"({PANO_ID})""#),
        format!(r#"\[2,\s*\\?"({PANO_ID})\\?""#),
        format!(r#"(?i)(?:pano|panoid|pano_id|panoId)\\?":\\?"({PANO_ID})\\?""#),
    ]
    .into_iter()
    .map(|pattern| Regex::new(&pattern).unwrap())
    .collect()
});

pub fn extract_panos(text: &str) -> Vec<String> {
    let mut seen = HashSet::new();
    let mut out = Vec::new();
    for re in PANO_RES.iter() {
        for cap in re.captures_iter(text) {
            let id = cap.get(1).unwrap().as_str().to_string();
            if seen.insert(id.clone()) {
                out.push(id);
            }
        }
    }
    out
}

#[cfg(test)]
mod tests {
    use super::extract_panos;

    #[test]
    fn extracts_legacy_rpc_panos() {
        let text = r#"[[2,"CAoSLEFGMVFpcE9wX1Jx"]] [[2,"CAoSLEFGMVFpcE9wX1Jx"]]"#;

        assert_eq!(extract_panos(text), vec!["CAoSLEFGMVFpcE9wX1Jx"]);
    }

    #[test]
    fn extracts_escaped_and_named_panos() {
        let text = r#"{\"panoId\":\"F:-P3bLNu2T8tQhzcAAABBAA\"},[2,\"CAoSLEFGMVFpcE5hbWVk\"]"#;

        assert_eq!(
            extract_panos(text),
            vec!["CAoSLEFGMVFpcE5hbWVk", "F:-P3bLNu2T8tQhzcAAABBAA"]
        );
    }
}
