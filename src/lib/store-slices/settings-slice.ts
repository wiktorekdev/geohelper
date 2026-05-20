import type { StateCreator } from "zustand";

import type { GeocodeProviderId } from "@/lib/geocode-providers";
import { MAP_PROVIDERS, type MapProviderId } from "@/lib/map-providers";
import type { Store } from "@/lib/store";
import {
  getSettingsStore,
  saveSetting,
  loadProviderFallback,
  loadGeocodeProviderFallback,
  loadCopyFormatFallback,
} from "@/lib/settings-persistence";

export type CopyFormat = "lat,lng" | "lat, lng" | "lng,lat";

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
  mapProvider: loadProviderFallback(),
  geocodeProvider: loadGeocodeProviderFallback(),
  googleApiKey: "",
  copyFormat: loadCopyFormatFallback(),
  alwaysOnTop: false,
  settingsOpen: false,
  markerColor: "#dc2626",
  markerBorderColor: "#ffffff",
  markerSize: 24,

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
      let mapProvider = (await store.get<MapProviderId>("mapProvider")) ?? loadProviderFallback();
      if (!MAP_PROVIDERS[mapProvider]) {
        mapProvider = "osm";
      }
      const geocodeProvider = (await store.get<GeocodeProviderId>("geocodeProvider")) ?? loadGeocodeProviderFallback();
      const copyFormat = (await store.get<CopyFormat>("copyFormat")) ?? loadCopyFormatFallback();
      const alwaysOnTop = (await store.get<boolean>("alwaysOnTop")) ?? false;
      const googleApiKey = (await store.get<string>("googleApiKey")) ?? "";
      const markerColor = (await store.get<string>("markerColor")) ?? "#dc2626";
      const markerBorderColor = (await store.get<string>("markerBorderColor")) ?? "#ffffff";
      const markerSize = (await store.get<number>("markerSize")) ?? 24;

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
      console.error("Failed to hydrate settings slice:", e);
    }
  },
  openSettings: () => set({ settingsOpen: true }),
  closeSettings: () => set({ settingsOpen: false }),
});
