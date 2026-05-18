import { useEffect } from "react";
import { isTauri } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

import { latLngClose } from "@/lib/coords";
import { errorMessage } from "@/lib/errors";
import { ipc } from "@/lib/ipc";
import { enrichLocation } from "@/lib/location-enrichment";
import { useStore } from "@/lib/store";
import type { Coords, Snapshot } from "@/types";

export function useBridge() {
  const setSnapshot = useStore((s) => s.setSnapshot);
  const pushCoords = useStore((s) => s.pushCoords);
  const setConn = useStore((s) => s.setConn);

  useEffect(() => {
    let mounted = true;
    const unsubs: Array<() => void> = [];
    let enrichToken = 0;
    let enrichmentAbort: AbortController | null = null;

    if (!isTauri()) {
      setConn({ kind: "disconnected", reason: "Waiting for the Tauri desktop bridge." });
      return () => {
        mounted = false;
      };
    }

    function nextEnrichmentSignal() {
      if (enrichmentAbort) enrichmentAbort.abort();
      enrichmentAbort = new AbortController();
      return enrichmentAbort.signal;
    }

    (async () => {
      try {
        const listeners = await Promise.all([
          listen<Snapshot>("state", (event) => setSnapshot(event.payload)),
          listen<Coords>("coords", (event) => {
            const coords = event.payload;
            const prev = useStore.getState().current;
            if (prev && latLngClose(prev.lat, prev.lng, coords.lat, coords.lng)) return;

            const token = ++enrichToken;
            const signal = nextEnrichmentSignal();
            pushCoords(coords);
            void enrichLocation(
              coords,
              () => mounted && token === enrichToken,
              signal,
            );
          }),
        ]);

        if (!mounted) {
          listeners.forEach((unsubscribe) => unsubscribe());
          return;
        }
        unsubs.push(...listeners);

        const snapshot = await ipc.getState();
        if (mounted) {
          setSnapshot(snapshot);
          if (snapshot.current) {
            const token = ++enrichToken;
            const signal = nextEnrichmentSignal();
            void enrichLocation(
              snapshot.current,
              () => mounted && token === enrichToken,
              signal,
            );
          }
        }
      } catch (error) {
        if (mounted) {
          setConn({ kind: "disconnected", reason: errorMessage(error, "Bridge setup failed") });
        }
      }
    })();

    return () => {
      mounted = false;
      enrichToken++;
      enrichmentAbort?.abort();
      unsubs.forEach((unsubscribe) => unsubscribe());
    };
  }, [setSnapshot, pushCoords, setConn]);
}
