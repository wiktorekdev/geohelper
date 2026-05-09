use anyhow::{anyhow, Result};
use serde::Deserialize;

const CDP_URL: &str = "http://localhost:9222/json";

#[derive(Debug, Deserialize)]
pub struct Target {
    #[serde(default)]
    pub r#type: String,
    #[serde(default)]
    pub url: String,
    #[serde(default)]
    pub title: String,
    #[serde(default, rename = "webSocketDebuggerUrl")]
    pub ws_url: String,
}

pub async fn find() -> Result<Target> {
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(4))
        .build()?;

    let targets: Vec<Target> = client.get(CDP_URL).send().await?.json().await?;

    let game_iframe = targets
        .iter()
        .find(|t| t.r#type == "iframe" && is_geoguessr(t) && looks_like_game(t));
    let game_page = targets
        .iter()
        .find(|t| t.r#type == "page" && is_geoguessr(t) && looks_like_game(t));
    let any_iframe = targets.iter().find(|t| t.r#type == "iframe" && is_geoguessr(t));
    let any_page = targets.iter().find(|t| t.r#type == "page" && is_geoguessr(t));

    let picked = game_iframe
        .or(game_page)
        .or(any_iframe)
        .or(any_page)
        .ok_or_else(|| anyhow!("no GeoGuessr target found"))?;

    Ok(Target {
        r#type: picked.r#type.clone(),
        url: picked.url.clone(),
        title: picked.title.clone(),
        ws_url: picked.ws_url.clone(),
    })
}

fn is_geoguessr(t: &Target) -> bool {
    if t.ws_url.is_empty() {
        return false;
    }
    t.url.contains("geoguessr.com") || t.title.contains("GeoGuessr")
}

fn looks_like_game(t: &Target) -> bool {
    let u = t.url.to_lowercase();
    u.contains("/game")
        || u.contains("/duels")
        || u.contains("/battle")
        || u.contains("/challenge")
        || u.contains("/quiz")
        || u.contains("/play")
}
