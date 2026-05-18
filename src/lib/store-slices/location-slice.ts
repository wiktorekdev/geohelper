import type { StateCreator } from "zustand";

import type { Coords, CountryDetails, PlaceInfo } from "@/types";
import type { Store } from "@/lib/store";

export type LocationSlice = {
  current: Coords | null;
  place: PlaceInfo;
  countryDetails: CountryDetails | null;
  geocodeError: string | null;
  locationLoading: boolean;

  setCurrent: (coords: Coords | null) => void;
  pushCoords: (coords: Coords) => void;
  setPlace: (place: PlaceInfo) => void;
  setCountryDetails: (details: CountryDetails | null) => void;
  setGeocodeError: (error: string | null) => void;
  setLocationLoading: (loading: boolean) => void;
  clearLocation: () => void;
};

export const createLocationSlice: StateCreator<Store, [], [], LocationSlice> = (set) => ({
  current: null,
  place: {},
  countryDetails: null,
  geocodeError: null,
  locationLoading: false,

  setCurrent: (current) => set({ current }),
  pushCoords: (current) => set({ current }),
  setPlace: (place) => set({ place }),
  setCountryDetails: (countryDetails) => set({ countryDetails }),
  setGeocodeError: (geocodeError) => set({ geocodeError }),
  setLocationLoading: (locationLoading) => set({ locationLoading }),
  clearLocation: () => set({ current: null, place: {}, countryDetails: null, geocodeError: null, locationLoading: false }),
});
