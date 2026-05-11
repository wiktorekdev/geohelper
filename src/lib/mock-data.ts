// Mock preview data used in edit mode when there's no real round active.
// Keeps the editor useful even when GeoGuessr isn't connected.

import type { Coords, CountryDetails, PlaceInfo } from "@/types";
import { useStore } from "./store";

export const MOCK_SOURCE = "mock";

const MOCK_COORDS: Coords = {
  lat: 48.8566,
  lng: 2.3522,
  source: MOCK_SOURCE,
  timestamp: Date.now(),
};

const MOCK_PLACE: PlaceInfo = {
  country: "France",
  countryCode: "fr",
  region: "Île-de-France",
  city: "Paris",
  neighbourhood: "4th Arrondissement",
  road: "Rue de Rivoli",
  postcode: "75004",
  continent: "Europe",
};

const MOCK_COUNTRY: CountryDetails = {
  flag: "🇫🇷",
  capital: "Paris",
  subregion: "Western Europe",
  languages: ["French"],
  currency: "EUR (€)",
  callingCode: "+33",
  timezones: ["UTC+01:00"],
};

/** Inject mock data only if the store has nothing real yet. */
export function injectMockIfEmpty(): void {
  const s = useStore.getState();
  if (s.current) return;
  s.pushCoords({ ...MOCK_COORDS, timestamp: Date.now() });
  s.setPlace(MOCK_PLACE);
  s.setCountryDetails(MOCK_COUNTRY);
}

/** Remove mock data if it's still there. Leaves real round data untouched. */
export function clearMockIfPresent(): void {
  const s = useStore.getState();
  if (s.current?.source !== MOCK_SOURCE) return;
  s.setSnapshot({ conn: s.conn, current: null, history: s.history });
  s.setPlace({});
  s.setCountryDetails(null);
}
