import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";

import { MAP_PROVIDERS } from "@/lib/map-providers";
import { useStore } from "@/lib/store";
import { GoogleMapView } from "./google-map-view";

const pinIcon = L.divIcon({
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  html: `
    <div style="position:relative; width:32px; height:32px;">
      <div style="position:absolute; inset:0; border-radius:9999px;
        background: radial-gradient(circle at 30% 30%, #fca5a5, #dc2626);
        box-shadow: 0 0 0 4px rgba(239,68,68,0.25), 0 6px 16px rgba(0,0,0,0.5);
        border: 2px solid #111;"></div>
      <div style="position:absolute; inset:10px; border-radius:9999px; background:#fff;
        box-shadow: inset 0 0 0 3px #dc2626;"></div>
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
