import { Store as TauriStore } from "@tauri-apps/plugin-store"
import { invoke } from "@tauri-apps/api/core"

import type { GeocodeProviderId } from "./geocode-providers"
import type { MapProviderId } from "./map-providers"
import type { CopyFormat } from "./store"
import { logger } from "./logger"

// Internal: legacy localStorage keys to migrate from. Do not export — call sites
// should read from the Tauri store via getSettingsStore / saveSetting.
const LEGACY_LOCAL_STORAGE_KEYS: Record<string, keyof SettingsSchema> = {
  "geohelper.provider": "mapProvider",
  "geohelper.geocodeProvider": "geocodeProvider",
  "geohelper.copyFormat": "copyFormat",
  "geohelper.alwaysOnTop": "alwaysOnTop",
  "geohelper.updateDismissed": "updateDismissed",
  "geohelper.display": "displayConfig",
  "geohelper.locale": "locale",
  "geohelper.last-window-width": "lastWindowWidth",
  "geohelper.googleApiKey": "googleApiKey",
}

export type SettingsSchema = {
  mapProvider: MapProviderId
  geocodeProvider: GeocodeProviderId
  copyFormat: CopyFormat
  alwaysOnTop: boolean
  updateDismissed: string
  googleApiKey: string
  markerColor: string
  markerBorderColor: string
  markerSize: number
  locale: string
  lastWindowWidth: number
  activeThemeId: string
  displayConfig: unknown
}

let storeInstance: TauriStore | null = null
let storePromise: Promise<TauriStore> | null = null
let resolvedStorePath: string | null = null

/**
 * Resolve the absolute settings.json path once via Tauri, then keep using it.
 * Falling back to a relative path used to create a *second* store file across
 * runs (one per cwd), which silently lost user data — never do that again.
 */
async function resolveStorePath(): Promise<string> {
  if (resolvedStorePath) return resolvedStorePath
  resolvedStorePath = await invoke<string>("get_store_path", { filename: "settings.json" })
  return resolvedStorePath
}

export function getSettingsStore(): Promise<TauriStore> {
  if (storeInstance) {
    return Promise.resolve(storeInstance)
  }
  if (!storePromise) {
    storePromise = (async () => {
      const storePath = await resolveStorePath()
      try {
        const store = await TauriStore.load(storePath, { defaults: {}, autoSave: true })
        storeInstance = store
        return store
      } catch (e) {
        logger.error(`Failed to load store at ${storePath}, attempting recovery:`, e)
        await invoke("handle_corrupted_store", { path: storePath })
        const store = await TauriStore.load(storePath, { defaults: {}, autoSave: true })
        storeInstance = store
        return store
      }
    })()
  }
  return storePromise
}

export async function migrateLegacyStorage() {
  try {
    const store = await getSettingsStore()
    const migrated = await store.get<boolean>("migrated")
    if (migrated) return

    const settingsPath = await resolveStorePath()

    // 1. Migrate themes from themes.json (delete only the migrated key, never clear).
    try {
      const themesPath = await invoke<string>("get_store_path", { filename: "themes.json" })
      const oldThemesStore = await TauriStore.load(themesPath, { defaults: {}, autoSave: true })
      const active = await oldThemesStore.get<string>("active")
      if (active) {
        await store.set("activeThemeId", active)
        await oldThemesStore.delete("active")
        await oldThemesStore.save()
      }
    } catch (e) {
      logger.warn("Themes migration failed:", e)
    }

    // 2. Migrate Google API key from a legacy *relative* settings.json — only if
    //    that path resolves to a different file than the active store. We never
    //    call .clear() on it: a relative-vs-absolute path race once wiped data.
    try {
      const legacyRelative = "settings.json"
      if (legacyRelative !== settingsPath) {
        const oldSettingsStore = await TauriStore.load(legacyRelative, {
          defaults: {},
          autoSave: true,
        })
        const googleApiKey = await oldSettingsStore.get<string>("googleApiKey")
        if (googleApiKey) {
          await store.set("googleApiKey", googleApiKey)
          await oldSettingsStore.delete("googleApiKey")
          await oldSettingsStore.save()
        }
      }
    } catch (e) {
      logger.warn("Legacy settings.json migration failed:", e)
    }

    // 3. Migrate from localStorage.
    for (const [localKey, storeKey] of Object.entries(LEGACY_LOCAL_STORAGE_KEYS)) {
      try {
        const value = localStorage.getItem(localKey)
        if (value === null) continue

        if (localKey === "geohelper.alwaysOnTop") {
          await store.set(storeKey, value === "true")
        } else if (localKey === "geohelper.display") {
          try {
            await store.set(storeKey, JSON.parse(value))
          } catch {
            // ignore invalid JSON
          }
        } else if (localKey === "geohelper.last-window-width") {
          const parsed = parseInt(value, 10)
          if (!Number.isNaN(parsed)) {
            await store.set(storeKey, parsed)
          }
        } else {
          await store.set(storeKey, value)
        }
        localStorage.removeItem(localKey)
      } catch (e) {
        logger.warn(`Localstorage key ${localKey} migration failed:`, e)
      }
    }

    await store.set("migrated", true)
    await store.save()
  } catch (e) {
    logger.error("Migration failed completely:", e)
  }
}

export async function saveSetting<K extends keyof SettingsSchema>(
  key: K,
  value: SettingsSchema[K]
): Promise<void> {
  try {
    const store = await getSettingsStore()
    await store.set(key, value)
    await store.save()
  } catch (e) {
    logger.error(`Failed to save setting ${key}:`, e)
  }
}
