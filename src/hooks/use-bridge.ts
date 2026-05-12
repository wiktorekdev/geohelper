import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";

import { useStore } from "@/lib/store";
import { ipc } from "@/lib/ipc";
import { reverseGeocode } from "@/lib/geocode";
import { fetchCountryDetails } from "@/lib/country-info";
import type { Coords, Round, Snapshot } from "@/types";

export function useBridge() {
  const setSnapshot = useStore((s) => s.setSnapshot);
  const pushCoords = useStore((s) => s.pushCoords);
  const pushRound = useStore((s) => s.pushRound);
  const setConn = useStore((s) => s.setConn);

  useEffect(() => {
    let mounted = true;
    const unsubs: Array<() => void> = [];
    let enrichToken = 0;

    (async () => {
      try {
        const listeners = await Promise.all([
          listen<Snapshot>("state", (e) => setSnapshot(e.payload)),
          listen<Snapshot["conn"]>("conn", (e) => setConn(e.payload)),
          listen<Coords>("coords", (e) => {
            const c = e.payload;
            const token = ++enrichToken;
            pushCoords(c);
            void enrichLocation(c, () => mounted && token === enrichToken);
          }),
          listen<Round>("round", (e) => pushRound(e.payload)),
        ]);

        if (!mounted) {
          listeners.forEach((u) => u());
          return;
        }
        unsubs.push(...listeners);

        const snap = await ipc.getState();
        if (mounted) {
          setSnapshot(snap);
          if (snap.current) {
            const token = ++enrichToken;
            void enrichLocation(snap.current, () => mounted && token === enrichToken);
          }
        }
      } catch (e) {
        if (mounted) setConn({ kind: "disconnected", reason: describeError(e) });
      }
    })();

    return () => {
      mounted = false;
      enrichToken++;
      unsubs.forEach((u) => u());
    };
  }, [setSnapshot, pushCoords, pushRound, setConn]);
}

async function enrichLocation(coords: Coords, isCurrent: () => boolean) {
  if (!isCurrent()) return;
  const { place, error } = await reverseGeocode(coords.lat, coords.lng);
  if (!isCurrent()) return;

  useStore.getState().setPlace(place);
  useStore.getState().setGeocodeError(error);

  if (place.countryCode) {
    const details = await fetchCountryDetails(place.countryCode);
    if (isCurrent() && useStore.getState().place.countryCode === place.countryCode) {
      useStore.getState().setCountryDetails(details);
    }
  } else {
    useStore.getState().setCountryDetails(null);
  }
}

function describeError(e: unknown): string {
  return e instanceof Error ? e.message : "Bridge setup failed";
}
