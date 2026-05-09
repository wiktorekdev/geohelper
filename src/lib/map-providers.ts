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
  | "dark"
  | "light"
  | "voyager"
  | "satellite"
  | "topo"
  | "osm"
  | "google-roadmap"
  | "google-satellite"
  | "google-hybrid";

export const MAP_PROVIDERS: Record<MapProviderId, MapProvider> = {
  dark: {
    kind: "leaflet",
    name: "CartoDB Dark",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: "(c) OpenStreetMap, (c) CARTO",
    maxZoom: 20,
    subdomains: "abcd",
  },
  light: {
    kind: "leaflet",
    name: "CartoDB Positron",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: "(c) OpenStreetMap, (c) CARTO",
    maxZoom: 20,
    subdomains: "abcd",
  },
  voyager: {
    kind: "leaflet",
    name: "CartoDB Voyager",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: "(c) OpenStreetMap, (c) CARTO",
    maxZoom: 20,
    subdomains: "abcd",
  },
  satellite: {
    kind: "leaflet",
    name: "Esri Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles (c) Esri",
    maxZoom: 19,
  },
  topo: {
    kind: "leaflet",
    name: "OpenTopoMap",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: "(c) OpenTopoMap (CC-BY-SA)",
    maxZoom: 17,
    subdomains: "abc",
  },
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
