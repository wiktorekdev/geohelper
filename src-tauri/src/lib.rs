mod cdp;
mod commands;
mod geo;
mod state;
mod util;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|app| {
            let shared = state::State::new();
            app.manage(shared.clone());

            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                cdp::run(handle, shared).await;
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_state,
            commands::reset_current,
            commands::clear_history,
            commands::reconnect,
            commands::set_always_on_top,
            commands::is_installed,
        ])
        .run(tauri::generate_context!())
        .expect("failed to start GeoHelper");
}
