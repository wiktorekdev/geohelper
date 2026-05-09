import { invoke } from "@tauri-apps/api/core";
import type { Snapshot } from "@/types";

export const ipc = {
  getState: () => invoke<Snapshot>("get_state"),
  resetCurrent: () => invoke<void>("reset_current"),
  clearHistory: () => invoke<void>("clear_history"),
  reconnect: () => invoke<void>("reconnect"),
  setAlwaysOnTop: (on: boolean) => invoke<void>("set_always_on_top", { on }),
};
