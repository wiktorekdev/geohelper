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
      styles?: google.maps.MapTypeStyle[];
    };

export type MapProviderId =
  | "osm"
  | "carto-voyager"
  | "carto-dark"
  | "google-roadmap"
  | "google-dark"
  | "google-hybrid";

export const MAP_PROVIDERS: Record<MapProviderId, MapProvider> = {
  osm: {
    kind: "leaflet",
    name: "OpenStreetMap",
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "(c) OpenStreetMap contributors",
    maxZoom: 19,
  },
  "carto-voyager": {
    kind: "leaflet",
    name: "CartoDB Voyager",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: "(c) OpenStreetMap contributors, (c) CARTO",
    maxZoom: 20,
    subdomains: "abcd",
  },
  "carto-dark": {
    kind: "leaflet",
    name: "CartoDB Dark Matter",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: "(c) OpenStreetMap contributors, (c) CARTO",
    maxZoom: 20,
    subdomains: "abcd",
  },
  "google-roadmap": {
    kind: "google",
    name: "Google Maps",
    mapTypeId: "roadmap",
  },
  "google-dark": {
    kind: "google",
    name: "Google Maps (Dark)",
    mapTypeId: "roadmap",
    styles: [
      { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
      { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
      { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
      {
        featureType: "administrative.locality",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
      },
      {
        featureType: "poi",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
      },
      {
        featureType: "poi.park",
        elementType: "geometry",
        stylers: [{ color: "#263c3f" }],
      },
      {
        featureType: "poi.park",
        elementType: "labels.text.fill",
        stylers: [{ color: "#6b9a76" }],
      },
      {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#38414e" }],
      },
      {
        featureType: "road",
        elementType: "geometry.stroke",
        stylers: [{ color: "#212a37" }],
      },
      {
        featureType: "road",
        elementType: "labels.text.fill",
        stylers: [{ color: "#9ca5b3" }],
      },
      {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [{ color: "#746855" }],
      },
      {
        featureType: "road.highway",
        elementType: "geometry.stroke",
        stylers: [{ color: "#1f2835" }],
      },
      {
        featureType: "road.highway",
        elementType: "labels.text.fill",
        stylers: [{ color: "#f3d19c" }],
      },
      {
        featureType: "transit",
        elementType: "geometry",
        stylers: [{ color: "#2f3948" }],
      },
      {
        featureType: "transit.station",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
      },
      {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#17263c" }],
      },
      {
        featureType: "water",
        elementType: "labels.text.fill",
        stylers: [{ color: "#515c6d" }],
      },
      {
        featureType: "water",
        elementType: "labels.text.stroke",
        stylers: [{ color: "#17263c" }],
      },
    ],
  },
  "google-hybrid": {
    kind: "google",
    name: "Google Hybrid",
    mapTypeId: "hybrid",
  },
};
