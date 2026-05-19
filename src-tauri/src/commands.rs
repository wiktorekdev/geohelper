use tauri::{AppHandle, Emitter, State, WebviewWindow};

use crate::state::{Shared, Snapshot};

#[tauri::command]
pub fn get_state(state: State<'_, Shared>) -> Snapshot {
    state.snapshot()
}

#[tauri::command]
pub fn reset_current(app: AppHandle, state: State<'_, Shared>) {
    state.reset();
    let _ = app.emit("state", &state.snapshot());
}

#[tauri::command]
pub fn clear_history(app: AppHandle, state: State<'_, Shared>) {
    state.clear_history();
    let _ = app.emit("state", &state.snapshot());
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
pub fn get_store_path(filename: Option<String>) -> String {
    let name = filename.unwrap_or_else(|| "settings.json".to_string());
    if crate::util::is_portable() {
        if let Ok(exe_path) = std::env::current_exe() {
            if let Some(exe_dir) = exe_path.parent() {
                // Ensure data directory exists
                let data_dir = exe_dir.join("data");
                if !data_dir.exists() {
                    let _ = std::fs::create_dir_all(&data_dir);
                }
                return data_dir.join(&name).to_string_lossy().to_string();
            }
        }
    }
    name
}

#[tauri::command]
pub fn handle_corrupted_store(app: AppHandle, path: String) {
    use tauri::Manager;
    let target_path = if std::path::Path::new(&path).is_absolute() {
        std::path::PathBuf::from(&path)
    } else {
        if let Ok(config_dir) = app.path().app_config_dir() {
            config_dir.join(&path)
        } else {
            return;
        }
    };

    if target_path.exists() {
        let corrupted_path = target_path.with_extension(format!(
            "json.corrupted-{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .map(|d| d.as_secs())
                .unwrap_or(0)
        ));
        let _ = std::fs::rename(&target_path, &corrupted_path);
    }
}
