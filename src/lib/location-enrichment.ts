import type { Coords } from "@/types";
import { latLngClose } from "@/lib/coords";
import { fetchCountryDetails } from "@/lib/country-info";
import { reverseGeocode } from "@/lib/geocode";
import { useStore } from "@/lib/store";

export async function enrichLocation(
  coords: Coords,
  isCurrent: () => boolean,
  signal?: AbortSignal,
): Promise<void> {
  if (!isCurrent() || signal?.aborted) return;

  const store = useStore.getState();
  store.setLocationLoading(true);

  const { place, error } = await reverseGeocode(coords.lat, coords.lng, signal);
  if (!isCurrent() || signal?.aborted) {
    store.setLocationLoading(false);
    return;
  }

  const cur = useStore.getState().current;
  if (!cur || !latLngClose(cur.lat, cur.lng, coords.lat, coords.lng)) {
    store.setLocationLoading(false);
    return;
  }

  const details = place.countryCode
    ? await fetchCountryDetails(place.countryCode, signal)
    : null;
  if (!isCurrent() || signal?.aborted) {
    store.setLocationLoading(false);
    return;
  }

  const latest = useStore.getState().current;
  if (!latest || !latLngClose(latest.lat, latest.lng, coords.lat, coords.lng)) {
    store.setLocationLoading(false);
    return;
  }

  // Batch update to prevent flickering - update all location data at once
  store.setPlace(place);
  store.setGeocodeError(error);
  store.setCountryDetails(details);
  store.setLocationLoading(false);
}
