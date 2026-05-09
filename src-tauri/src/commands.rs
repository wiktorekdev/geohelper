use tauri::{State, WebviewWindow};

use crate::state::{Shared, Snapshot};

#[tauri::command]
pub fn get_state(state: State<'_, Shared>) -> Snapshot {
    state.snapshot()
}

#[tauri::command]
pub fn reset_current(state: State<'_, Shared>) {
    state.reset();
}

#[tauri::command]
pub fn clear_history(state: State<'_, Shared>) {
    state.clear_history();
}

#[tauri::command]
pub fn reconnect(state: State<'_, Shared>) {
    state.kick.notify_waiters();
}

#[tauri::command]
pub fn set_always_on_top(window: WebviewWindow, on: bool) -> Result<(), String> {
    window
        .set_always_on_top(on)
        .map_err(|e| format!("set_always_on_top({on}) failed: {e}"))
}
