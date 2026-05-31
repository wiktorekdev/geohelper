mod cdp;
mod commands;
mod geo;
mod state;
mod util;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            let _ = app.get_webview_window("main").map(|w| w.set_focus());
        }))
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

            let mut builder = tauri::webview::WebviewWindowBuilder::new(
                app,
                "main",
                tauri::WebviewUrl::App("index.html".into()),
            )
            .title("GeoHelper")
            .inner_size(1280.0, 820.0)
            .min_inner_size(960.0, 640.0)
            .resizable(true)
            .fullscreen(false)
            .shadow(true);

            if util::is_portable() {
                if let Ok(exe_path) = std::env::current_exe() {
                    if let Some(exe_dir) = exe_path.parent() {
                        let webview_dir = exe_dir.join("data").join("webview");
                        builder = builder.data_directory(webview_dir);
                    }
                }
            }

            let _window = builder.build()?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_state,
            commands::reset_current,
            commands::clear_history,
            commands::reconnect,
            commands::set_always_on_top,
            commands::is_installed,
            commands::get_store_path,
            commands::handle_corrupted_store,
            commands::sync_and_read_changelog,
        ])
        .run(tauri::generate_context!())
        .expect("failed to start GeoHelper");
}
