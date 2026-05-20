import { create } from "zustand"
import type { Update } from "@tauri-apps/plugin-updater"
import { relaunch } from "@tauri-apps/plugin-process"

import { ipc } from "./ipc"
import { getSettingsStore, saveSetting } from "./settings-persistence"
import { checkForUpdate, type UpdateInfo } from "./update-check"
import { errorMessage } from "./errors"
import { t } from "@/lib/i18n"

type UpdateStore = {
  updateInfo: UpdateInfo | null
  updateChecking: boolean
  updateDismissed: string
  updateError: string | null
  updateHandle: Update | null
  installState: "idle" | "downloading" | "installing" | "done" | "error"
  installError: string | null
  downloadedBytes: number
  totalBytes: number | null
  isInstalled: boolean | null

  runUpdateCheck: () => Promise<void>
  dismissUpdate: () => void
  installUpdate: () => Promise<void>
  detectInstallKind: () => Promise<void>
  hydrate: () => Promise<void>
}

export const useUpdateStore = create<UpdateStore>((set, get) => ({
  updateInfo: null,
  updateChecking: false,
  updateDismissed: "",
  updateError: null,
  updateHandle: null,
  installState: "idle",
  installError: null,
  downloadedBytes: 0,
  totalBytes: null,
  isInstalled: null,

  runUpdateCheck: async () => {
    if (get().updateChecking) return
    set({ updateChecking: true, updateError: null })
    const result = await checkForUpdate()
    if (result.ok) {
      set({
        updateInfo: result.info,
        updateHandle: result.handle,
        updateChecking: false,
        updateError: null,
      })
      return
    }

    set({
      updateInfo: null,
      updateHandle: null,
      updateChecking: false,
      updateError: result.error,
    })
  },
  dismissUpdate: () => {
    const latest = get().updateInfo?.latest ?? ""
    void saveSetting("updateDismissed", latest)
    set({ updateDismissed: latest })
  },
  installUpdate: async () => {
    const handle = get().updateHandle
    if (!handle) return
    if (get().installState === "downloading" || get().installState === "installing") return

    set({
      installState: "downloading",
      installError: null,
      downloadedBytes: 0,
      totalBytes: null,
    })

    try {
      await handle.downloadAndInstall((event) => {
        switch (event.event) {
          case "Started":
            set({ totalBytes: event.data.contentLength ?? null, downloadedBytes: 0 })
            break
          case "Progress":
            set((state) => ({ downloadedBytes: state.downloadedBytes + event.data.chunkLength }))
            break
          case "Finished":
            set({ installState: "installing" })
            break
        }
      })

      set({ installState: "done" })
      await relaunch()
    } catch (error) {
      set({
        installState: "error",
        installError: errorMessage(error, t("update.installFailed")),
      })
    }
  },
  detectInstallKind: async () => {
    try {
      const installed = await ipc.isInstalled()
      set({ isInstalled: installed })
    } catch {
      set({ isInstalled: null })
    }
  },
  hydrate: async () => {
    try {
      const store = await getSettingsStore()
      const stored = await store.get<string>("updateDismissed")
      if (stored) {
        set({ updateDismissed: stored })
      }
    } catch {
      /* ignore */
    }
  },
}))
