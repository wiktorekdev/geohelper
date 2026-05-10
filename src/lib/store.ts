import { create } from "zustand";
import type { ConnState, Coords, CountryDetails, PlaceInfo, Round } from "@/types";
import { type MapProviderId } from "./map-providers";
import { type GeocodeProviderId } from "./geocode-providers";
import { checkForUpdate, type UpdateInfo } from "./update-check";
import type { Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import {
  loadBool,
  loadCopyFormat,
  loadGeocodeProvider,
  loadProvider,
  loadString,
  loadTheme,
  saveBool,
  saveString,
  STORAGE_KEYS,
} from "./settings-persistence";

export type Theme = "dark" | "light";
export type CopyFormat = "lat,lng" | "lat, lng" | "lng,lat";

type Store = {
  conn: ConnState;
  current: Coords | null;
  history: Round[];
  place: PlaceInfo;
  countryDetails: CountryDetails | null;

  provider: MapProviderId;
  geocodeProvider: GeocodeProviderId;
  googleApiKey: string;
  copyFormat: CopyFormat;
  theme: Theme;
  alwaysOnTop: boolean;
  settingsOpen: boolean;

  updateInfo: UpdateInfo | null;
  updateChecking: boolean;
  updateDismissed: string;
  updateError: string | null;
  updateHandle: Update | null;
  installState: "idle" | "downloading" | "installing" | "done" | "error";
  installError: string | null;
  downloadedBytes: number;
  totalBytes: number | null;
  geocodeError: string | null;

  setSnapshot: (s: { conn: ConnState; current: Coords | null; history: Round[] }) => void;
  setConn: (c: ConnState) => void;
  pushCoords: (c: Coords) => void;
  pushRound: (r: Round) => void;
  setPlace: (p: PlaceInfo) => void;
  setCountryDetails: (d: CountryDetails | null) => void;
  setGeocodeError: (error: string | null) => void;

  setProvider: (p: MapProviderId) => void;
  setGeocodeProvider: (p: GeocodeProviderId) => void;
  setGoogleApiKey: (key: string) => void;
  setCopyFormat: (f: CopyFormat) => void;
  setTheme: (t: Theme) => void;
  setAlwaysOnTop: (v: boolean) => void;

  openSettings: () => void;
  closeSettings: () => void;

  runUpdateCheck: () => Promise<void>;
  dismissUpdate: () => void;
  installUpdate: () => Promise<void>;
};

export const useStore = create<Store>((set, get) => ({
  conn: { kind: "idle" },
  current: null,
  history: [],
  place: {},
  countryDetails: null,

  provider: loadProvider(),
  geocodeProvider: loadGeocodeProvider(),
  googleApiKey: loadString(STORAGE_KEYS.googleApiKey),
  copyFormat: loadCopyFormat(),
  theme: loadTheme(),
  alwaysOnTop: loadBool(STORAGE_KEYS.alwaysOnTop, false),
  settingsOpen: false,

  updateInfo: null,
  updateChecking: false,
  updateDismissed: loadString(STORAGE_KEYS.updateDismissed),
  updateError: null,
  updateHandle: null,
  installState: "idle",
  installError: null,
  downloadedBytes: 0,
  totalBytes: null,
  geocodeError: null,

  setSnapshot: (s) => set({ conn: s.conn, current: s.current, history: s.history }),
  setConn: (c) => set({ conn: c }),
  pushCoords: (c) => set({ current: c }),
  pushRound: (r) =>
    set((st) => ({
      history: [...st.history.filter((h) => h.index !== r.index), r].slice(-500),
    })),
  setPlace: (p) => set({ place: p }),
  setCountryDetails: (d) => set({ countryDetails: d }),
  setGeocodeError: (error) => set({ geocodeError: error }),

  setProvider: (p) => {
    saveString(STORAGE_KEYS.provider, p);
    set({ provider: p });
  },
  setGeocodeProvider: (p) => {
    saveString(STORAGE_KEYS.geocodeProvider, p);
    set({ geocodeProvider: p, geocodeError: null });
  },
  setGoogleApiKey: (k) => {
    saveString(STORAGE_KEYS.googleApiKey, k);
    set({ googleApiKey: k, geocodeError: null });
  },
  setCopyFormat: (f) => {
    saveString(STORAGE_KEYS.copyFormat, f);
    set({ copyFormat: f });
  },
  setTheme: (t) => {
    saveString(STORAGE_KEYS.theme, t);
    set({ theme: t });
  },
  setAlwaysOnTop: (v) => {
    saveBool(STORAGE_KEYS.alwaysOnTop, v);
    set({ alwaysOnTop: v });
  },

  openSettings: () => set({ settingsOpen: true }),
  closeSettings: () => set({ settingsOpen: false }),

  runUpdateCheck: async () => {
    if (get().updateChecking) return;
    set({ updateChecking: true, updateError: null });
    const result = await checkForUpdate();
    if (result.ok) {
      set({
        updateInfo: result.info,
        updateHandle: result.handle,
        updateChecking: false,
        updateError: null,
      });
    } else {
      set({
        updateInfo: null,
        updateHandle: null,
        updateChecking: false,
        updateError: result.error,
      });
    }
  },
  dismissUpdate: () => {
    const latest = get().updateInfo?.latest ?? "";
    saveString(STORAGE_KEYS.updateDismissed, latest);
    set({ updateDismissed: latest });
  },
  installUpdate: async () => {
    const handle = get().updateHandle;
    if (!handle) return;
    if (get().installState === "downloading" || get().installState === "installing") return;

    set({
      installState: "downloading",
      installError: null,
      downloadedBytes: 0,
      totalBytes: null,
    });

    try {
      await handle.downloadAndInstall((event) => {
        switch (event.event) {
          case "Started":
            set({ totalBytes: event.data.contentLength ?? null, downloadedBytes: 0 });
            break;
          case "Progress":
            set((st) => ({ downloadedBytes: st.downloadedBytes + event.data.chunkLength }));
            break;
          case "Finished":
            set({ installState: "installing" });
            break;
        }
      });

      set({ installState: "done" });
      await relaunch();
    } catch (e) {
      set({
        installState: "error",
        installError: e instanceof Error ? e.message : "Install failed",
      });
    }
  },
}));

export function formatCoords(c: Coords, fmt: CopyFormat): string {
  switch (fmt) {
    case "lat,lng": return `${c.lat},${c.lng}`;
    case "lng,lat": return `${c.lng},${c.lat}`;
    case "lat, lng":
    default: return `${c.lat}, ${c.lng}`;
  }
}
