import { Store as TauriStore } from "@tauri-apps/plugin-store";
import { invoke } from "@tauri-apps/api/core";

import type { GeocodeProviderId } from "./geocode-providers";
import type { MapProviderId } from "./map-providers";
import type { CopyFormat } from "./store";

export const STORAGE_KEYS = {
  provider: "geohelper.provider",
  geocodeProvider: "geohelper.geocodeProvider",
  copyFormat: "geohelper.copyFormat",
  alwaysOnTop: "geohelper.alwaysOnTop",
  updateDismissed: "geohelper.updateDismissed",
};

let storePromise: Promise<TauriStore> | null = null;

export function getSettingsStore(): Promise<TauriStore> {
  if (!storePromise) {
    storePromise = (async () => {
      let storePath = "settings.json";
      try {
        storePath = await invoke<string>("get_store_path", { filename: "settings.json" });
      } catch {
        // ignore and use relative default
      }

      try {
        return await TauriStore.load(storePath, { defaults: {}, autoSave: true });
      } catch (e) {
        console.error(`Failed to load store at ${storePath}, attempting recovery:`, e);
        try {
          await invoke("handle_corrupted_store", { path: storePath });
          return await TauriStore.load(storePath, { defaults: {}, autoSave: true });
        } catch (innerError) {
          console.error("Critical: settings recovery failed, falling back to relative store:", innerError);
          try {
            await invoke("handle_corrupted_store", { path: "settings.json" });
            return await TauriStore.load("settings.json", { defaults: {}, autoSave: true });
          } catch {
            return await TauriStore.load("settings.json", { defaults: {}, autoSave: true });
          }
        }
      }
    })();
  }
  return storePromise;
}

export async function migrateLegacyStorage() {
  try {
    const store = await getSettingsStore();
    const migrated = await store.get<boolean>("migrated");
    if (migrated) return;

    // 1. Migrate themes from themes.json
    try {
      const themesPath = await invoke<string>("get_store_path", { filename: "themes.json" });
      const oldThemesStore = await TauriStore.load(themesPath, { defaults: {}, autoSave: true });
      
      const active = await oldThemesStore.get<string>("active");
      if (active) {
        await store.set("activeThemeId", active);
        await oldThemesStore.delete("active");
        await oldThemesStore.save();
      }
    } catch (e) {
      console.warn("Themes migration failed:", e);
    }

    // 2. Migrate Google API Key from old settings.json
    try {
      const oldSettingsStore = await TauriStore.load("settings.json", { defaults: {}, autoSave: true });
      const googleApiKey = await oldSettingsStore.get<string>("googleApiKey");
      if (googleApiKey) {
        await store.set("googleApiKey", googleApiKey);
        await oldSettingsStore.clear();
      }
    } catch (e) {
      console.warn("Legacy settings.json migration failed:", e);
    }

    // 3. Migrate from localStorage
    const migrationKeys: Record<string, string> = {
      "geohelper.provider": "mapProvider",
      "geohelper.geocodeProvider": "geocodeProvider",
      "geohelper.copyFormat": "copyFormat",
      "geohelper.alwaysOnTop": "alwaysOnTop",
      "geohelper.updateDismissed": "updateDismissed",
      "geohelper.display": "displayConfig",
      "geohelper.locale": "locale",
      "geohelper.last-window-width": "lastWindowWidth",
      "geohelper.googleApiKey": "googleApiKey",
    };

    for (const [localKey, storeKey] of Object.entries(migrationKeys)) {
      try {
        const value = localStorage.getItem(localKey);
        if (value !== null) {
          if (localKey === "geohelper.alwaysOnTop") {
            await store.set(storeKey, value === "true");
          } else if (localKey === "geohelper.display") {
            try {
              const parsed = JSON.parse(value);
              await store.set(storeKey, parsed);
            } catch {
              // ignore invalid JSON
            }
          } else if (localKey === "geohelper.last-window-width") {
            const parsed = parseInt(value, 10);
            if (!isNaN(parsed)) {
              await store.set(storeKey, parsed);
            }
          } else {
            await store.set(storeKey, value);
          }
          localStorage.removeItem(localKey);
        }
      } catch (e) {
        console.warn(`Localstorage key ${localKey} migration failed:`, e);
      }
    }

    // Mark as migrated
    await store.set("migrated", true);
    await store.save();
  } catch (e) {
    console.error("Migration failed completely:", e);
  }
}

export async function saveSetting(key: string, value: unknown): Promise<void> {
  try {
    const store = await getSettingsStore();
    await store.set(key, value);
    await store.save();
  } catch (e) {
    console.error(`Failed to save setting ${key}:`, e);
  }
}

export function loadProviderFallback(): MapProviderId {
  return "osm";
}

export function loadGeocodeProviderFallback(): GeocodeProviderId {
  return "nominatim";
}

export function loadCopyFormatFallback(): CopyFormat {
  return "lat, lng";
}
