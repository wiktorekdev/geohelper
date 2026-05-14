import type { PlaceInfo } from "@/types";
import { useStore } from "./store";
import { runGeocode, type GeocodeProviderId } from "./geocode-providers";

type ReverseGeocodeResult = {
  place: PlaceInfo;
  error: string | null;
};

const CACHE = new Map<string, { value: ReverseGeocodeResult; expiresAt: number }>();
const MAX_CACHE = 250;
const CACHE_TTL_MS = 30 * 60 * 1000;

export async function reverseGeocode(
  lat: number,
  lng: number,
  signal?: AbortSignal,
): Promise<ReverseGeocodeResult> {
  const { geocodeProvider, googleApiKey } = useStore.getState();
  const provider: GeocodeProviderId =
    geocodeProvider === "google" && !googleApiKey.trim() ? "nominatim" : geocodeProvider;
  const key = [
    provider,
    provider === "google" ? googleApiKey.trim() : "",
    lat.toFixed(3),
    lng.toFixed(3),
  ].join(":");
  const cached = CACHE.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.value;
  if (cached) CACHE.delete(key);

  const result = await runGeocode(provider, lat, lng, googleApiKey, signal);
  CACHE.set(key, { value: result, expiresAt: Date.now() + CACHE_TTL_MS });
  trimCache();
  return result;
}

function trimCache() {
  for (const [key, cached] of CACHE) {
    if (cached.expiresAt <= Date.now()) CACHE.delete(key);
  }
  while (CACHE.size > MAX_CACHE) {
    const oldest = CACHE.keys().next().value;
    if (!oldest) break;
    CACHE.delete(oldest);
  }
}
