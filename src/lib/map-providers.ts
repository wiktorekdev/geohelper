export type MapProvider =
  | {
      kind: "leaflet";
      name: string;
      url: string;
      attribution: string;
      maxZoom: number;
      subdomains?: string;
    }
  | {
      kind: "google";
      name: string;
      mapTypeId: "roadmap" | "satellite" | "hybrid" | "terrain";
    };

export type MapProviderId =
  | "osm"
  | "google-roadmap"
  | "google-satellite"
  | "google-hybrid";

export const MAP_PROVIDERS: Record<MapProviderId, MapProvider> = {
  osm: {
    kind: "leaflet",
    name: "OpenStreetMap",
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "(c) OpenStreetMap contributors",
    maxZoom: 19,
  },
  "google-roadmap": {
    kind: "google",
    name: "Google Maps",
    mapTypeId: "roadmap",
  },
  "google-satellite": {
    kind: "google",
    name: "Google Satellite",
    mapTypeId: "satellite",
  },
  "google-hybrid": {
    kind: "google",
    name: "Google Hybrid",
    mapTypeId: "hybrid",
  },
};
