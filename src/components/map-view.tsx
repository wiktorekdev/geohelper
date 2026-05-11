import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";

import { MAP_PROVIDERS } from "@/lib/map-providers";
import { useStore } from "@/lib/store";
import { GoogleMapView } from "./google-map-view";

// Mirrors the Google Maps marker: 10px red dot with a white 4px ring and a
// subtle drop shadow so it reads clearly on any tile style.
const pinIcon = L.divIcon({
  className: "",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  html: `
    <div style="
      width:24px; height:24px; position:relative;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));
    ">
      <div style="
        position:absolute; inset:0;
        background:#dc2626;
        border-radius:9999px;
        border:4px solid #ffffff;
      "></div>
    </div>
  `,
});

export function MapView() {
  const current = useStore((s) => s.current);
  const providerId = useStore((s) => s.provider);
  const apiKey = useStore((s) => s.googleApiKey);
  const provider = MAP_PROVIDERS[providerId];

  return (
    <div className="relative flex-1 min-h-0">
      {provider.kind === "google" ? (
        <GoogleMapView
          apiKey={apiKey}
          mapTypeId={provider.mapTypeId}
          center={current ? { lat: current.lat, lng: current.lng } : null}
        />
      ) : (
        <MapContainer
          center={[20, 0]}
          zoom={2}
          scrollWheelZoom
          worldCopyJump
          className="absolute inset-0"
        >
          <TileLayer
            url={provider.url}
            attribution={provider.attribution}
            maxZoom={provider.maxZoom}
            subdomains={provider.subdomains ?? "abc"}
          />
          {current && (
            <>
              <Marker position={[current.lat, current.lng]} icon={pinIcon} />
              <PanTo lat={current.lat} lng={current.lng} />
            </>
          )}
        </MapContainer>
      )}
    </div>
  );
}

function PanTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  useEffect(() => {
    map.panTo([lat, lng], { animate: true, duration: 0.6 });
  }, [lat, lng, map]);

  return null;
}
