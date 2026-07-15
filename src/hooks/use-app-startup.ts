import { useEffect } from "react"

import { ipc } from "@/lib/ipc"
import { useI18n } from "@/lib/i18n"
import { logger } from "@/lib/logger"
import { migrateLegacyStorage } from "@/lib/settings-persistence"
import { useStore } from "@/lib/store"
import { useThemeStore } from "@/lib/themes/store"
import { useUpdateStore } from "@/lib/update-store"
import { useDisplayStore } from "@/lib/display-store"

export function useAppStartup() {
  const hydrateSettings = useStore((state) => state.hydrateSettings)
  const alwaysOnTop = useStore((state) => state.alwaysOnTop)
  const hydrateDisplay = useDisplayStore((state) => state.hydrate)
  const hydrateUpdate = useUpdateStore((state) => state.hydrate)
  const runUpdateCheck = useUpdateStore((state) => state.runUpdateCheck)
  const detectInstallKind = useUpdateStore((state) => state.detectInstallKind)

  useEffect(() => {
    const start = async () => {
      try {
        await migrateLegacyStorage()
        const tasks = [
          ["settings", hydrateSettings()],
          ["display", hydrateDisplay()],
          ["locale", useI18n.getState().hydrate()],
          ["theme", useThemeStore.getState().hydrate()],
          ["update", hydrateUpdate()],
        ] as const
        const results = await Promise.allSettled(tasks.map(([, task]) => task))
        results.forEach((result, index) => {
          if (result.status === "rejected") {
            logger.error(`Failed to hydrate ${tasks[index][0]}:`, result.reason)
          }
        })
        void runUpdateCheck()
        void detectInstallKind()
      } catch (error) {
        logger.error("Failed startup store migration and hydration:", error)
      }
    }

    void start()
  }, [hydrateSettings, hydrateDisplay, hydrateUpdate, runUpdateCheck, detectInstallKind])

  useEffect(() => {
    const timeout = setTimeout(() => {
      ipc.setAlwaysOnTop(alwaysOnTop).catch((error) => {
        logger.warn("setAlwaysOnTop failed:", error)
      })
    }, 50)
    return () => clearTimeout(timeout)
  }, [alwaysOnTop])

  useEffect(() => {
    if (import.meta.env.DEV) return
    const handleContextMenu = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.closest("input, textarea, [contenteditable='true']")) return
      event.preventDefault()
    }
    document.addEventListener("contextmenu", handleContextMenu)
    return () => document.removeEventListener("contextmenu", handleContextMenu)
  }, [])
}
