use tauri::{AppHandle, Emitter, State, WebviewWindow};

use crate::state::{Shared, Snapshot};

#[tauri::command]
pub fn get_state(state: State<'_, Shared>) -> Snapshot {
    state.snapshot()
}

#[tauri::command]
pub fn reset_current(app: AppHandle, state: State<'_, Shared>) -> Result<(), String> {
    state.reset();
    app.emit("state", &state.snapshot())
        .map_err(|e| format!("Failed to emit reset state: {e}"))
}

#[tauri::command]
pub fn clear_history(app: AppHandle, state: State<'_, Shared>) -> Result<(), String> {
    state.clear_history();
    app.emit("state", &state.snapshot())
        .map_err(|e| format!("Failed to emit cleared history: {e}"))
}

#[tauri::command]
pub fn reconnect(state: State<'_, Shared>) {
    state.reconnect();
}

#[tauri::command]
pub fn set_always_on_top(window: WebviewWindow, on: bool) -> Result<(), String> {
    window
        .set_always_on_top(on)
        .map_err(|e| format!("set_always_on_top({on}) failed: {e}"))
}

/// Whether the running binary was launched from a system install (NSIS, .deb, .dmg)
/// or a portable copy / AppImage. Auto-update via `setup.exe` only makes sense for
/// installed builds on Windows; portable users should just download the new binary.
#[tauri::command]
pub fn is_installed() -> bool {
    install_kind() == InstallKind::Installed
}

#[derive(Debug, PartialEq, Eq)]
enum InstallKind {
    Installed,
    Portable,
}

#[cfg(target_os = "windows")]
fn install_kind() -> InstallKind {
    use std::path::Path;

    // Heuristic: if uninstall.exe sits next to the running binary, NSIS put it there
    // during a normal install. Portable copies are just the raw exe.
    if let Ok(exe) = std::env::current_exe() {
        if let Some(dir) = exe.parent() {
            let uninstaller = Path::new(dir).join("uninstall.exe");
            if uninstaller.exists() {
                return InstallKind::Installed;
            }
        }
    }
    InstallKind::Portable
}

#[cfg(target_os = "linux")]
fn install_kind() -> InstallKind {
    // AppImage mounts itself via APPIMAGE env var and updates itself in place via the
    // plugin. We treat that as installed for the auto-update UX.
    if std::env::var_os("APPIMAGE").is_some() {
        return InstallKind::Installed;
    }
    // Anything under /usr, /opt or similar system prefixes came from a .deb/.rpm.
    if let Ok(exe) = std::env::current_exe() {
        let path = exe.to_string_lossy();
        if path.starts_with("/usr/") || path.starts_with("/opt/") {
            return InstallKind::Installed;
        }
    }
    InstallKind::Portable
}

#[cfg(target_os = "macos")]
fn install_kind() -> InstallKind {
    // macOS builds always ship as a .app bundle. The updater replaces the bundle in
    // place regardless of where it lives.
    InstallKind::Installed
}

#[cfg(not(any(target_os = "windows", target_os = "linux", target_os = "macos")))]
fn install_kind() -> InstallKind {
    InstallKind::Portable
}

#[tauri::command]
pub fn get_store_path(filename: Option<String>) -> Result<String, String> {
    let name = filename.unwrap_or_else(|| "settings.json".to_string());
    if crate::util::is_portable() {
        if let Ok(exe_path) = std::env::current_exe() {
            if let Some(exe_dir) = exe_path.parent() {
                // Ensure data directory exists
                let data_dir = exe_dir.join("data");
                if !data_dir.exists() {
                    std::fs::create_dir_all(&data_dir)
                        .map_err(|e| format!("Failed to create portable data directory: {e}"))?;
                }
                return Ok(data_dir.join(&name).to_string_lossy().to_string());
            }
        }
    }
    Ok(name)
}

#[tauri::command]
pub fn handle_corrupted_store(app: AppHandle, path: String) -> Result<(), String> {
    use tauri::Manager;
    let target_path = if std::path::Path::new(&path).is_absolute() {
        std::path::PathBuf::from(&path)
    } else {
        app.path()
            .app_config_dir()
            .map(|dir| dir.join(&path))
            .map_err(|e| format!("Failed to resolve config dir: {e}"))?
    };

    if target_path.exists() {
        let corrupted_path = target_path.with_extension(format!(
            "json.corrupted-{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .map(|d| d.as_secs())
                .unwrap_or(0)
        ));
        std::fs::rename(&target_path, &corrupted_path)
            .map_err(|e| format!("Failed to rename corrupted store: {e}"))?;
    }
    Ok(())
}
#[tauri::command]
pub async fn sync_and_read_changelog(app: AppHandle) -> Result<String, String> {
    use std::fs;
    use tauri::Manager;

    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get AppData dir: {e}"))?;

    // Create the directory if it doesn't exist
    if !app_data_dir.exists() {
        fs::create_dir_all(&app_data_dir)
            .map_err(|e| format!("Failed to create AppData directory: {e}"))?;
    }

    let cache_file = app_data_dir.join("changelog.cache");

    // Try fetching from GitHub with a client setup
    let client = reqwest::Client::new();
    let url = "https://raw.githubusercontent.com/wiktorekdev/geohelper/main/CHANGELOG.md";

    match client.get(url).send().await {
        Ok(res) => {
            if res.status().is_success() {
                if let Ok(text) = res.text().await {
                    // Update cache asynchronously
                    if let Err(e) = fs::write(&cache_file, &text) {
                        eprintln!("Failed to write changelog cache: {e}");
                    }
                    return Ok(text);
                }
            }
        }
        Err(e) => {
            eprintln!("Failed to fetch changelog online, falling back to cache: {e}");
        }
    }

    // Fallback: Read cache
    if cache_file.exists() {
        fs::read_to_string(&cache_file)
            .map_err(|e| format!("Failed to read cached changelog: {e}"))
    } else {
        Ok("# Changelog\n\nNo cached changelog available. Connect to the internet to fetch updates.".to_string())
    }
}
