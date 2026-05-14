use serde::Deserialize;

pub fn build_script(pano_id: &str) -> String {
    let escaped = serde_json::to_string(pano_id).unwrap_or_else(|_| "\"\"".into());
    format!(
        r#"new Promise(resolve => {{
  try {{
    if (!window.google || !window.google.maps || !window.google.maps.StreetViewService) {{
      resolve(JSON.stringify({{ error: 'GOOGLE_MAPS_NOT_READY' }}));
      return;
    }}
    const sv = new window.google.maps.StreetViewService();
    sv.getPanorama({{ pano: {escaped} }}, (data, status) => {{
      if (status === 'OK' && data && data.location && data.location.latLng) {{
        resolve(JSON.stringify({{
          lat: data.location.latLng.lat(),
          lng: data.location.latLng.lng(),
          description: data.location.description || '',
          status
        }}));
      }} else {{
        resolve(JSON.stringify({{ error: status || 'NO_PANORAMA_DATA' }}));
      }}
    }});
  }} catch (err) {{
    resolve(JSON.stringify({{ error: 'TRANSIENT_' + err.message }}));
  }}
}})"#
    )
}

#[derive(Debug)]
pub enum ResolverOutcome {
    Resolved { lat: f64, lng: f64 },
    NotFound,
    GoogleNotReady,
    Timeout,
    InvalidResponse,
    Transient(String),
    Error(String),
}

#[derive(Debug, Deserialize)]
#[serde(untagged)]
enum RawResolved {
    Ok { lat: f64, lng: f64 },
    Err { error: String },
}

pub fn parse(raw: &str) -> ResolverOutcome {
    match serde_json::from_str(raw) {
        Ok(RawResolved::Ok { lat, lng }) => ResolverOutcome::Resolved { lat, lng },
        Ok(RawResolved::Err { error }) => match error.as_str() {
            "ZERO_RESULTS" | "NOT_FOUND" => ResolverOutcome::NotFound,
            "GOOGLE_MAPS_NOT_READY" => ResolverOutcome::GoogleNotReady,
            "TIMEOUT" => ResolverOutcome::Timeout,
            "OVER_QUERY_LIMIT" | "UNKNOWN_ERROR" => ResolverOutcome::Transient(error),
            "NO_PANORAMA_DATA" => ResolverOutcome::InvalidResponse,
            _ if error.starts_with("TRANSIENT_") => ResolverOutcome::Transient(error),
            _ => ResolverOutcome::Error(error),
        },
        Err(_) => ResolverOutcome::InvalidResponse,
    }
}

#[cfg(test)]
mod tests {
    use super::{parse, ResolverOutcome};

    #[test]
    fn parses_ok_coordinates() {
        match parse(r#"{"lat":52.1,"lng":21.2}"#) {
            ResolverOutcome::Resolved { lat, lng } => {
                assert_eq!(lat, 52.1);
                assert_eq!(lng, 21.2);
            }
            other => panic!("unexpected result: {other:?}"),
        }
    }

    #[test]
    fn classifies_known_errors() {
        assert!(matches!(
            parse(r#"{"error":"ZERO_RESULTS"}"#),
            ResolverOutcome::NotFound
        ));
        assert!(matches!(
            parse(r#"{"error":"GOOGLE_MAPS_NOT_READY"}"#),
            ResolverOutcome::GoogleNotReady
        ));
        assert!(matches!(
            parse("not json"),
            ResolverOutcome::InvalidResponse
        ));
    }
}
