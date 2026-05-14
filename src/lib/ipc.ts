import { invoke } from "@tauri-apps/api/core";
import type { Snapshot } from "@/types";

export const ipc = {
  getState: () => invoke<Snapshot>("get_state"),
  setAlwaysOnTop: (on: boolean) => invoke<void>("set_always_on_top", { on }),
  isInstalled: () => invoke<boolean>("is_installed"),
};
