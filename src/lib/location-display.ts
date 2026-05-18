import type { Coords, CountryDetails, PlaceInfo } from "@/types";
import { continentFrom } from "@/lib/continents";

export type LocationDisplay =
  | { kind: "error" }
  | { kind: "sparse"; primary: string; continent?: string }
  | { kind: "continent"; continent: string }
  | { kind: "loading"; rough?: string }
  | { kind: "empty" }
  | {
      kind: "settlement";
      country: string;
      countryCode?: string;
      areaLine: string;
      regionLine: string;
      continentLine: string;
    };

export function deriveLocationDisplay(
  place: PlaceInfo,
  details: CountryDetails | null,
  current: Coords | null,
  geocodeError: string | null,
  loading: boolean,
): LocationDisplay {
  const hasSettlement = !!(place.country || place.region || place.city);

  // If loading and we have previous data, keep showing it instead of intermediate states
  if (loading && hasSettlement) {
    return {
      kind: "settlement",
      country: place.country || "-",
      countryCode: place.countryCode,
      areaLine: uniqueLine(place.neighbourhood, place.city),
      regionLine: uniqueLine(place.county, place.region),
      continentLine: composeContinentLine(place.continent, details?.subregion),
    };
  }

  if (!hasSettlement) {
    if (geocodeError) return { kind: "error" };

    const sparseLine = uniqueLine(place.neighbourhood, place.road, place.postcode);
    if (sparseLine) return { kind: "sparse", primary: sparseLine, continent: place.continent };
    if (place.continent) return { kind: "continent", continent: place.continent };
    if (current) return { kind: "loading", rough: continentFrom(undefined, current.lat, current.lng) };
    return { kind: "empty" };
  }

  return {
    kind: "settlement",
    country: place.country || "-",
    countryCode: place.countryCode,
    areaLine: uniqueLine(place.neighbourhood, place.city),
    regionLine: uniqueLine(place.county, place.region),
    continentLine: composeContinentLine(place.continent, details?.subregion),
  };
}

function uniqueLine(...values: Array<string | undefined>): string {
  const seen = new Set<string>();
  const parts: string[] = [];
  for (const value of values) {
    if (!value || seen.has(value)) continue;
    seen.add(value);
    parts.push(value);
  }
  return parts.join(" - ");
}

function composeContinentLine(continent?: string, subregion?: string): string {
  if (!continent && !subregion) return "";
  if (!continent) return subregion!;
  if (!subregion) return continent;
  if (subregion === continent) return continent;
  if (subregion.toLowerCase().includes(continent.toLowerCase())) return subregion;
  return `${continent} - ${subregion}`;
}
