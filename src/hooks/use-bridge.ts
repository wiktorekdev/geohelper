import { useEffect } from "react"
import { isTauri } from "@tauri-apps/api/core"
import { listen } from "@tauri-apps/api/event"

import { errorMessage } from "@/lib/errors"
import { ipc } from "@/lib/ipc"
import { createLocationEnrichmentSession } from "@/lib/location-enrichment"
import { useStore } from "@/lib/store"
import type { Coords, Snapshot } from "@/types"
import { t } from "@/lib/i18n"

export function useBridge() {
  const setSnapshot = useStore((s) => s.setSnapshot)
  const setConn = useStore((s) => s.setConn)

  useEffect(() => {
    let mounted = true
    const unsubs: Array<() => void> = []
    const enrichment = createLocationEnrichmentSession(() => mounted)

    if (!isTauri()) {
      setConn({ kind: "disconnected", reason: t("bridge.waiting") })
      return () => {
        mounted = false
        enrichment.cancel()
      }
    }

    ;(async () => {
      try {
        const listeners = await Promise.all([
          listen<Snapshot>("state", (event) => setSnapshot(event.payload)),
          listen<Coords>("coords", (event) => enrichment.start(event.payload)),
        ])

        if (!mounted) {
          listeners.forEach((unsubscribe) => unsubscribe())
          return
        }
        unsubs.push(...listeners)

        const snapshot = await ipc.getState()
        if (mounted) {
          if (snapshot.current) {
            enrichment.start(snapshot.current)
          }
          setSnapshot(snapshot)
        }
      } catch (error) {
        if (mounted) {
          setConn({ kind: "disconnected", reason: errorMessage(error, t("bridge.setupFailed")) })
        }
      }
    })()

    return () => {
      mounted = false
      enrichment.cancel()
      unsubs.forEach((unsubscribe) => unsubscribe())
    }
  }, [setSnapshot, setConn])
}
