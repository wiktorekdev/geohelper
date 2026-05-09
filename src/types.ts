export type Coords = {
  lat: number;
  lng: number;
  source: string;
  timestamp: number;
};

export type Round = {
  index: number;
  coords: Coords;
};

export type ConnState =
  | { kind: "idle" }
  | { kind: "searching" }
  | { kind: "connected" }
  | { kind: "disconnected"; reason: string };

export type PlaceInfo = {
  country?: string;
  countryCode?: string;
  region?: string;
  county?: string;
  city?: string;
  neighbourhood?: string;
  road?: string;
  postcode?: string;
  continent?: string;
};

export type CountryDetails = {
  flag?: string;
  capital?: string;
  subregion?: string;
  languages?: string[];
  currency?: string;
  callingCode?: string;
  timezones?: string[];
};

export type Snapshot = {
  conn: ConnState;
  current: Coords | null;
  history: Round[];
};
