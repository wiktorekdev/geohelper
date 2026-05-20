import type { PlaceInfo } from "@/types"
import { continentFrom } from "./continents"
import { errorMessage } from "./errors"
import { timeoutSignal } from "./fetch-timeout"
import { t } from "@/lib/i18n"
import { VERSION } from "./links"

export type GeocodeProviderId = "nominatim" | "google"

export type GeocodeProvider = {
  id: GeocodeProviderId
  name: string
  needsKey: boolean
  reverse: (
    lat: number,
    lng: number,
    apiKey: string,
    fallbackContinent?: string,
    signal?: AbortSignal
  ) => Promise<PlaceInfo>
}

export type GeocodeResult = {
  place: PlaceInfo
  error: string | null
}

export const GEOCODE_PROVIDERS: Record<GeocodeProviderId, GeocodeProvider> = {
  nominatim: {
    id: "nominatim",
    name: "OpenStreetMap (Nominatim)",
    needsKey: false,
    reverse: (lat, lng, _apiKey, fallbackContinent, signal) =>
      nominatim(lat, lng, fallbackContinent, signal),
  },
  google: {
    id: "google",
    name: "Google Geocoding",
    needsKey: true,
    reverse: google,
  },
}

export async function runGeocode(
  provider: GeocodeProviderId,
  lat: number,
  lng: number,
  apiKey: string,
  signal?: AbortSignal
): Promise<GeocodeResult> {
  const fallbackContinent = continentFrom(undefined, lat, lng)
  try {
    const config = GEOCODE_PROVIDERS[provider]
    if (config.needsKey && !apiKey.trim()) {
      return { place: { continent: fallbackContinent }, error: null }
    }
    const place = await config.reverse(lat, lng, apiKey, fallbackContinent, signal)
    return { place, error: null }
  } catch (e) {
    if (signal?.aborted) return { place: { continent: fallbackContinent }, error: null }
    return {
      place: { continent: fallbackContinent },
      error: errorMessage(e, t("geocode.error")),
    }
  }
}

async function nominatim(
  lat: number,
  lng: number,
  fallbackContinent?: string,
  signal?: AbortSignal
): Promise<PlaceInfo> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&accept-language=en&addressdetails=1`
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": `GeoHelper/${VERSION} (github.com/wiktorekdev/geohelper)`,
    },
    signal: timeoutSignal(undefined, signal),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = (await res.json()) as {
    error?: string
    address?: Record<string, string | undefined>
  }
  if (data.error) throw new Error(data.error)
  const addr = data.address ?? {}
  return {
    country: addr.country,
    countryCode: addr.country_code,
    region: addr.state || addr.region,
    county: addr.county,
    city: addr.city || addr.town || addr.village || addr.hamlet || addr.municipality,
    neighbourhood: addr.suburb || addr.neighbourhood || addr.quarter,
    road: addr.road,
    postcode: addr.postcode,
    continent: continentFrom(addr.country_code, lat, lng) ?? fallbackContinent,
  }
}

async function google(
  lat: number,
  lng: number,
  apiKey: string,
  fallbackContinent?: string,
  signal?: AbortSignal
): Promise<PlaceInfo> {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${encodeURIComponent(apiKey)}&language=en`
  const res = await fetch(url, { signal: timeoutSignal(undefined, signal) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  if (data.status !== "OK" || !data.results?.[0]) throw new Error(data.status || "empty")

  const comps = data.results[0].address_components as Array<{
    long_name: string
    short_name: string
    types: string[]
  }>
  const findBy = (...types: string[]) => comps.find((c) => types.some((t) => c.types.includes(t)))

  const country = findBy("country")
  const region = findBy("administrative_area_level_1")
  const county = findBy("administrative_area_level_2")
  const city = findBy("locality", "postal_town", "administrative_area_level_3")
  const neighbourhood = findBy("neighborhood", "sublocality", "sublocality_level_1")
  const road = findBy("route")
  const postcode = findBy("postal_code")
  const cc = country?.short_name?.toLowerCase()

  return {
    country: country?.long_name,
    countryCode: cc,
    region: region?.long_name,
    county: county?.long_name,
    city: city?.long_name,
    neighbourhood: neighbourhood?.long_name,
    road: road?.long_name,
    postcode: postcode?.long_name,
    continent: continentFrom(cc, lat, lng) ?? fallbackContinent,
  }
}
