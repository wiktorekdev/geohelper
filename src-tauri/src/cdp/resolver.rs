use serde::Deserialize;

pub fn build_script(pano_id: &str) -> String {
    // Runs inside the GeoGuessr page - assumes google.maps is loaded.
    // Returns a JSON string that we then parse on the Rust side.
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

#[derive(Debug, Deserialize)]
#[serde(untagged)]
pub enum Resolved {
    Ok { lat: f64, lng: f64 },
    Err { error: String },
}

pub fn parse(raw: &str) -> Resolved {
    serde_json::from_str(raw).unwrap_or(Resolved::Err {
        error: "INVALID_RESOLVER_RESPONSE".into(),
    })
}
