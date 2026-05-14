import { GEOCODE_PROVIDERS, type GeocodeProviderId } from "./geocode-providers";
import { MAP_PROVIDERS, type MapProviderId } from "./map-providers";
import type { CopyFormat, Theme } from "./store";

export const STORAGE_KEYS = {
  provider: "geohelper.provider",
  geocodeProvider: "geohelper.geocodeProvider",
  copyFormat: "geohelper.copyFormat",
  theme: "geohelper.theme",
  alwaysOnTop: "geohelper.alwaysOnTop",
  updateDismissed: "geohelper.updateDismissed",
};

const COPY_FORMATS: CopyFormat[] = ["lat,lng", "lat, lng", "lng,lat"];
const THEMES: Theme[] = ["dark", "light"];

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function saveString(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    return false;
  }
  return true;
}

export function saveBool(key: string, value: boolean) {
  return saveString(key, String(value));
}

function oneOf<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  return value !== null && allowed.includes(value as T) ? (value as T) : fallback;
}

export function loadProvider(): MapProviderId {
  return oneOf(read(STORAGE_KEYS.provider), Object.keys(MAP_PROVIDERS) as MapProviderId[], "osm");
}

export function loadGeocodeProvider(): GeocodeProviderId {
  return oneOf(
    read(STORAGE_KEYS.geocodeProvider),
    Object.keys(GEOCODE_PROVIDERS) as GeocodeProviderId[],
    "nominatim",
  );
}

export function loadCopyFormat(): CopyFormat {
  return oneOf(read(STORAGE_KEYS.copyFormat), COPY_FORMATS, "lat, lng");
}

export function loadTheme(): Theme {
  return oneOf(read(STORAGE_KEYS.theme), THEMES, "dark");
}

export function loadString(key: string, fallback = ""): string {
  return read(key) ?? fallback;
}

export function loadBool(key: string, fallback: boolean): boolean {
  const raw = read(key);
  if (raw === "true") return true;
  if (raw === "false") return false;
  return fallback;
}
