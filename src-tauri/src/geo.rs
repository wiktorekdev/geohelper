pub fn is_valid(lat: f64, lng: f64) -> bool {
    lat.is_finite()
        && lng.is_finite()
        && !(lat == 0.0 && lng == 0.0)
        && (-90.0..=90.0).contains(&lat)
        && (-180.0..=180.0).contains(&lng)
}
