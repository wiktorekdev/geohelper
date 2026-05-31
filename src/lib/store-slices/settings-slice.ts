import type { StateCreator } from "zustand"

import type { GeocodeProviderId } from "@/lib/geocode-providers"
import { MAP_PROVIDERS, type MapProviderId } from "@/lib/map-providers"
import type { Store } from "@/lib/store"
import { getSettingsStore, saveSetting, type SettingsSchema } from "@/lib/settings-persistence"
import { logger } from "@/lib/logger"
import { normalizeHexColor } from "@/lib/utils"

export type CopyFormat = "lat,lng" | "lat, lng" | "lng,lat"

const DEFAULT_MAP_PROVIDER: MapProviderId = "osm"
const DEFAULT_GEOCODE_PROVIDER: GeocodeProviderId = "nominatim"
const DEFAULT_COPY_FORMAT: CopyFormat = "lat, lng"
const DEFAULT_MARKER_COLOR = "#dc2626"
const DEFAULT_MARKER_BORDER = "#ffffff"
const DEFAULT_MARKER_SIZE = 24
const MARKER_MIN_SIZE = 8
const MARKER_MAX_SIZE = 96
const MARKER_SAVE_DELAY_MS = 250

const saveTimers = new Map<string, ReturnType<typeof setTimeout>>()

function scheduleSaveSetting<K extends keyof SettingsSchema>(key: K, value: SettingsSchema[K]) {
  const previous = saveTimers.get(key)
  if (previous) clearTimeout(previous)
  saveTimers.set(
    key,
    setTimeout(() => {
      saveTimers.delete(key)
      void saveSetting(key, value)
    }, MARKER_SAVE_DELAY_MS)
  )
}

function normalizeMarkerSize(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return DEFAULT_MARKER_SIZE
  return Math.max(MARKER_MIN_SIZE, Math.min(MARKER_MAX_SIZE, Math.round(value)))
}

export type SettingsSlice = {
  mapProvider: MapProviderId
  geocodeProvider: GeocodeProviderId
  googleApiKey: string
  copyFormat: CopyFormat
  alwaysOnTop: boolean
  settingsOpen: boolean
  changelogOpen: boolean
  markerColor: string
  markerBorderColor: string
  markerSize: number

  setMapProvider: (provider: MapProviderId) => void
  setGeocodeProvider: (provider: GeocodeProviderId) => void
  setGoogleApiKey: (key: string) => void
  setCopyFormat: (format: CopyFormat) => void
  setAlwaysOnTop: (value: boolean) => void
  setMarkerColor: (color: string) => void
  setMarkerBorderColor: (color: string) => void
  setMarkerSize: (size: number) => void
  hydrateSettings: () => Promise<void>
  openSettings: () => void
  closeSettings: () => void
  openChangelog: () => void
  closeChangelog: () => void
}

export const createSettingsSlice: StateCreator<Store, [], [], SettingsSlice> = (set) => ({
  mapProvider: DEFAULT_MAP_PROVIDER,
  geocodeProvider: DEFAULT_GEOCODE_PROVIDER,
  googleApiKey: "",
  copyFormat: DEFAULT_COPY_FORMAT,
  alwaysOnTop: false,
  settingsOpen: false,
  changelogOpen: false,
  markerColor: DEFAULT_MARKER_COLOR,
  markerBorderColor: DEFAULT_MARKER_BORDER,
  markerSize: DEFAULT_MARKER_SIZE,

  setMapProvider: (mapProvider) => {
    void saveSetting("mapProvider", mapProvider)
    set({ mapProvider })
  },
  setGeocodeProvider: (geocodeProvider) => {
    void saveSetting("geocodeProvider", geocodeProvider)
    set({ geocodeProvider, geocodeError: null })
  },
  setGoogleApiKey: (value) => {
    const googleApiKey = value.trim()
    void saveSetting("googleApiKey", googleApiKey)
    set({ googleApiKey, geocodeError: null })
  },
  setCopyFormat: (copyFormat) => {
    void saveSetting("copyFormat", copyFormat)
    set({ copyFormat })
  },
  setAlwaysOnTop: (alwaysOnTop) => {
    void saveSetting("alwaysOnTop", alwaysOnTop)
    set({ alwaysOnTop })
  },
  setMarkerColor: (markerColor) => {
    markerColor = normalizeHexColor(markerColor, DEFAULT_MARKER_COLOR)
    scheduleSaveSetting("markerColor", markerColor)
    set({ markerColor })
  },
  setMarkerBorderColor: (markerBorderColor) => {
    markerBorderColor = normalizeHexColor(markerBorderColor, DEFAULT_MARKER_BORDER)
    scheduleSaveSetting("markerBorderColor", markerBorderColor)
    set({ markerBorderColor })
  },
  setMarkerSize: (markerSize) => {
    markerSize = normalizeMarkerSize(markerSize)
    scheduleSaveSetting("markerSize", markerSize)
    set({ markerSize })
  },
  hydrateSettings: async () => {
    try {
      const store = await getSettingsStore()
      let mapProvider = (await store.get<MapProviderId>("mapProvider")) ?? DEFAULT_MAP_PROVIDER
      if (!MAP_PROVIDERS[mapProvider]) {
        mapProvider = DEFAULT_MAP_PROVIDER
      }
      const geocodeProvider =
        (await store.get<GeocodeProviderId>("geocodeProvider")) ?? DEFAULT_GEOCODE_PROVIDER
      const copyFormat = (await store.get<CopyFormat>("copyFormat")) ?? DEFAULT_COPY_FORMAT
      const alwaysOnTop = (await store.get<boolean>("alwaysOnTop")) ?? false
      const googleApiKey = (await store.get<string>("googleApiKey")) ?? ""
      const markerColor = normalizeHexColor(
        await store.get<string>("markerColor"),
        DEFAULT_MARKER_COLOR
      )
      const markerBorderColor = normalizeHexColor(
        await store.get<string>("markerBorderColor"),
        DEFAULT_MARKER_BORDER
      )
      const markerSize = normalizeMarkerSize(await store.get<number>("markerSize"))

      set({
        mapProvider,
        geocodeProvider,
        copyFormat,
        alwaysOnTop,
        googleApiKey,
        markerColor,
        markerBorderColor,
        markerSize,
      })
    } catch (e) {
      logger.error("Failed to hydrate settings slice:", e)
    }
  },
  openSettings: () => set({ settingsOpen: true, changelogOpen: false }),
  closeSettings: () => set({ settingsOpen: false }),
  openChangelog: () => set({ changelogOpen: true, settingsOpen: false }),
  closeChangelog: () => set({ changelogOpen: false }),
})
