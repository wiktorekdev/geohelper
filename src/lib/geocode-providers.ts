import type { PlaceInfo } from "@/types";
import { continentFrom } from "./continents";

export type GeocodeProviderId = "nominatim" | "bigdatacloud" | "google";

export const GEOCODE_PROVIDERS: Record<
  GeocodeProviderId,
  { name: string; needsKey: boolean }
> = {
  nominatim: { name: "OpenStreetMap (Nominatim)", needsKey: false },
  bigdatacloud: { name: "BigDataCloud", needsKey: false },
  google: { name: "Google Geocoding", needsKey: true },
};

export type GeocodeResult = {
  place: PlaceInfo;
  error: string | null;
};

export async function runGeocode(
  provider: GeocodeProviderId,
  lat: number,
  lng: number,
  apiKey: string,
): Promise<GeocodeResult> {
  const fallbackContinent = continentFrom(undefined, lat, lng);
  try {
    let place: PlaceInfo;
    switch (provider) {
      case "nominatim":
        place = await nominatim(lat, lng, fallbackContinent);
        break;
      case "bigdatacloud":
        place = await bigDataCloud(lat, lng, fallbackContinent);
        break;
      case "google":
        if (!apiKey.trim()) return { place: { continent: fallbackContinent }, error: null };
        place = await google(lat, lng, apiKey, fallbackContinent);
        break;
    }
    return { place, error: null };
  } catch (e) {
    return {
      place: { continent: fallbackContinent },
      error: e instanceof Error ? e.message : "Reverse geocoding failed",
    };
  }
}

let nominatimLast = 0;
const NOMINATIM_MIN = 1100;

async function nominatim(lat: number, lng: number, fallbackContinent?: string): Promise<PlaceInfo> {
  const wait = Math.max(0, NOMINATIM_MIN - (Date.now() - nominatimLast));
  if (wait > 0) await sleep(wait);
  nominatimLast = Date.now();

  // zoom=14 is detailed enough for roads / neighbourhoods when they exist.
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&accept-language=en&addressdetails=1`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const addr = data.address ?? {};
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
  };
}

async function bigDataCloud(lat: number, lng: number, fallbackContinent?: string): Promise<PlaceInfo> {
  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const d = await res.json();
  return {
    country: d.countryName || undefined,
    countryCode: d.countryCode?.toLowerCase(),
    region: d.principalSubdivision || undefined,
    city: d.city || d.locality || undefined,
    continent: d.continent || continentFrom(d.countryCode, lat, lng) || fallbackContinent,
  };
}

async function google(
  lat: number,
  lng: number,
  apiKey: string,
  fallbackContinent?: string,
): Promise<PlaceInfo> {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${encodeURIComponent(apiKey)}&language=en`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data.status !== "OK" || !data.results?.[0]) throw new Error(data.status || "empty");

  const comps = data.results[0].address_components as Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
  const findBy = (...types: string[]) =>
    comps.find((c) => types.some((t) => c.types.includes(t)));

  const country = findBy("country");
  const region = findBy("administrative_area_level_1");
  const county = findBy("administrative_area_level_2");
  const city = findBy("locality", "postal_town", "administrative_area_level_3");
  const neighbourhood = findBy("neighborhood", "sublocality", "sublocality_level_1");
  const road = findBy("route");
  const postcode = findBy("postal_code");
  const cc = country?.short_name?.toLowerCase();

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
  };
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
