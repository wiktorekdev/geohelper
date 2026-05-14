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
  const { place, error } = await reverseGeocode(coords.lat, coords.lng, signal);
  if (!isCurrent() || signal?.aborted) return;

  const cur = useStore.getState().current;
  if (!cur || !latLngClose(cur.lat, cur.lng, coords.lat, coords.lng)) return;

  const details = place.countryCode
    ? await fetchCountryDetails(place.countryCode, signal)
    : null;
  if (!isCurrent() || signal?.aborted) return;

  const latest = useStore.getState().current;
  if (!latest || !latLngClose(latest.lat, latest.lng, coords.lat, coords.lng)) return;

  useStore.getState().setPlace(place);
  useStore.getState().setGeocodeError(error);
  useStore.getState().setCountryDetails(details);
}
