import type { StateCreator } from "zustand";

import type { GeocodeProviderId } from "@/lib/geocode-providers";
import type { MapProviderId } from "@/lib/map-providers";
import type { Store } from "@/lib/store";
import {
  loadBool,
  loadCopyFormat,
  loadGeocodeProvider,
  loadProvider,
  saveBool,
  saveString,
  STORAGE_KEYS,
} from "@/lib/settings-persistence";
import { loadGoogleApiKey, saveGoogleApiKey } from "@/lib/secure-settings";

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
  loadSecureSettings: () => Promise<void>;
  openSettings: () => void;
  closeSettings: () => void;
};

export const createSettingsSlice: StateCreator<Store, [], [], SettingsSlice> = (set) => ({
  mapProvider: loadProvider(),
  geocodeProvider: loadGeocodeProvider(),
  googleApiKey: "",
  copyFormat: loadCopyFormat(),
  alwaysOnTop: loadBool(STORAGE_KEYS.alwaysOnTop, false),
  settingsOpen: false,

  setMapProvider: (mapProvider) => {
    saveString(STORAGE_KEYS.provider, mapProvider);
    set({ mapProvider });
  },
  setGeocodeProvider: (geocodeProvider) => {
    saveString(STORAGE_KEYS.geocodeProvider, geocodeProvider);
    set({ geocodeProvider, geocodeError: null });
  },
  setGoogleApiKey: (value) => {
    const googleApiKey = value.trim();
    void saveGoogleApiKey(googleApiKey);
    set({ googleApiKey, geocodeError: null });
  },
  setCopyFormat: (copyFormat) => {
    saveString(STORAGE_KEYS.copyFormat, copyFormat);
    set({ copyFormat });
  },
  setAlwaysOnTop: (alwaysOnTop) => {
    saveBool(STORAGE_KEYS.alwaysOnTop, alwaysOnTop);
    set({ alwaysOnTop });
  },
  loadSecureSettings: async () => {
    const googleApiKey = await loadGoogleApiKey();
    set({ googleApiKey });
  },
  openSettings: () => set({ settingsOpen: true }),
  closeSettings: () => set({ settingsOpen: false }),
});
