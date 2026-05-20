import type { StateCreator } from "zustand";

import type { GeocodeProviderId } from "@/lib/geocode-providers";
import { MAP_PROVIDERS, type MapProviderId } from "@/lib/map-providers";
import type { Store } from "@/lib/store";
import { getSettingsStore, saveSetting } from "@/lib/settings-persistence";
import { logger } from "@/lib/logger";

export type CopyFormat = "lat,lng" | "lat, lng" | "lng,lat";

const DEFAULT_MAP_PROVIDER: MapProviderId = "osm";
const DEFAULT_GEOCODE_PROVIDER: GeocodeProviderId = "nominatim";
const DEFAULT_COPY_FORMAT: CopyFormat = "lat, lng";
const DEFAULT_MARKER_COLOR = "#dc2626";
const DEFAULT_MARKER_BORDER = "#ffffff";
const DEFAULT_MARKER_SIZE = 24;

export type SettingsSlice = {
  mapProvider: MapProviderId;
  geocodeProvider: GeocodeProviderId;
  googleApiKey: string;
  copyFormat: CopyFormat;
  alwaysOnTop: boolean;
  settingsOpen: boolean;
  markerColor: string;
  markerBorderColor: string;
  markerSize: number;

  setMapProvider: (provider: MapProviderId) => void;
  setGeocodeProvider: (provider: GeocodeProviderId) => void;
  setGoogleApiKey: (key: string) => void;
  setCopyFormat: (format: CopyFormat) => void;
  setAlwaysOnTop: (value: boolean) => void;
  setMarkerColor: (color: string) => void;
  setMarkerBorderColor: (color: string) => void;
  setMarkerSize: (size: number) => void;
  hydrateSettings: () => Promise<void>;
  openSettings: () => void;
  closeSettings: () => void;
};

export const createSettingsSlice: StateCreator<Store, [], [], SettingsSlice> = (set) => ({
  mapProvider: DEFAULT_MAP_PROVIDER,
  geocodeProvider: DEFAULT_GEOCODE_PROVIDER,
  googleApiKey: "",
  copyFormat: DEFAULT_COPY_FORMAT,
  alwaysOnTop: false,
  settingsOpen: false,
  markerColor: DEFAULT_MARKER_COLOR,
  markerBorderColor: DEFAULT_MARKER_BORDER,
  markerSize: DEFAULT_MARKER_SIZE,

  setMapProvider: (mapProvider) => {
    void saveSetting("mapProvider", mapProvider);
    set({ mapProvider });
  },
  setGeocodeProvider: (geocodeProvider) => {
    void saveSetting("geocodeProvider", geocodeProvider);
    set({ geocodeProvider, geocodeError: null });
  },
  setGoogleApiKey: (value) => {
    const googleApiKey = value.trim();
    void saveSetting("googleApiKey", googleApiKey);
    set({ googleApiKey, geocodeError: null });
  },
  setCopyFormat: (copyFormat) => {
    void saveSetting("copyFormat", copyFormat);
    set({ copyFormat });
  },
  setAlwaysOnTop: (alwaysOnTop) => {
    void saveSetting("alwaysOnTop", alwaysOnTop);
    set({ alwaysOnTop });
  },
  setMarkerColor: (markerColor) => {
    void saveSetting("markerColor", markerColor);
    set({ markerColor });
  },
  setMarkerBorderColor: (markerBorderColor) => {
    void saveSetting("markerBorderColor", markerBorderColor);
    set({ markerBorderColor });
  },
  setMarkerSize: (markerSize) => {
    void saveSetting("markerSize", markerSize);
    set({ markerSize });
  },
  hydrateSettings: async () => {
    try {
      const store = await getSettingsStore();
      let mapProvider = (await store.get<MapProviderId>("mapProvider")) ?? DEFAULT_MAP_PROVIDER;
      if (!MAP_PROVIDERS[mapProvider]) {
        mapProvider = DEFAULT_MAP_PROVIDER;
      }
      const geocodeProvider = (await store.get<GeocodeProviderId>("geocodeProvider")) ?? DEFAULT_GEOCODE_PROVIDER;
      const copyFormat = (await store.get<CopyFormat>("copyFormat")) ?? DEFAULT_COPY_FORMAT;
      const alwaysOnTop = (await store.get<boolean>("alwaysOnTop")) ?? false;
      const googleApiKey = (await store.get<string>("googleApiKey")) ?? "";
      const markerColor = (await store.get<string>("markerColor")) ?? DEFAULT_MARKER_COLOR;
      const markerBorderColor = (await store.get<string>("markerBorderColor")) ?? DEFAULT_MARKER_BORDER;
      const markerSize = (await store.get<number>("markerSize")) ?? DEFAULT_MARKER_SIZE;

      set({
        mapProvider,
        geocodeProvider,
        copyFormat,
        alwaysOnTop,
        googleApiKey,
        markerColor,
        markerBorderColor,
        markerSize,
      });
    } catch (e) {
      logger.error("Failed to hydrate settings slice:", e);
    }
  },
  openSettings: () => set({ settingsOpen: true }),
  closeSettings: () => set({ settingsOpen: false }),
});
