import type { StateCreator } from "zustand";

import type { GeocodeProviderId } from "@/lib/geocode-providers";
import type { MapProviderId } from "@/lib/map-providers";
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

  setMapProvider: (provider: MapProviderId) => void;
  setGeocodeProvider: (provider: GeocodeProviderId) => void;
  setGoogleApiKey: (key: string) => void;
  setCopyFormat: (format: CopyFormat) => void;
  setAlwaysOnTop: (value: boolean) => void;
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
  hydrateSettings: async () => {
    try {
      const store = await getSettingsStore();
      const mapProvider = (await store.get<MapProviderId>("mapProvider")) ?? loadProviderFallback();
      const geocodeProvider = (await store.get<GeocodeProviderId>("geocodeProvider")) ?? loadGeocodeProviderFallback();
      const copyFormat = (await store.get<CopyFormat>("copyFormat")) ?? loadCopyFormatFallback();
      const alwaysOnTop = (await store.get<boolean>("alwaysOnTop")) ?? false;
      const googleApiKey = (await store.get<string>("googleApiKey")) ?? "";

      set({
        mapProvider,
        geocodeProvider,
        copyFormat,
        alwaysOnTop,
        googleApiKey,
      });
    } catch (e) {
      console.error("Failed to hydrate settings slice:", e);
    }
  },
  openSettings: () => set({ settingsOpen: true }),
  closeSettings: () => set({ settingsOpen: false }),
});
