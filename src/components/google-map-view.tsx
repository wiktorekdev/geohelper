import { useEffect, useRef, useState } from "react";

import { loadGoogleMaps } from "@/lib/google-maps-loader";

type Props = {
  apiKey: string;
  mapTypeId: "roadmap" | "satellite" | "hybrid" | "terrain";
  center: { lat: number; lng: number } | null;
};

export function GoogleMapView({ apiKey, mapTypeId, center }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    mapRef.current = null;
    markerRef.current = null;
    if (containerRef.current) containerRef.current.replaceChildren();
    setMapReady(false);
    setError(null);
    loadGoogleMaps(apiKey)
      .then(() => {
        if (cancelled || !containerRef.current) return;
        if (!mapRef.current) {
          mapRef.current = new google.maps.Map(containerRef.current, {
            center: center ?? { lat: 20, lng: 0 },
            zoom: 2,
            mapTypeId,
            disableDefaultUI: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
            clickableIcons: false,
            gestureHandling: "greedy",
            zoomControl: false,
          });
        }
        setMapReady(true);
      })
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [apiKey]);

  useEffect(() => {
    if (mapRef.current) mapRef.current.setMapTypeId(mapTypeId);
  }, [mapTypeId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map || !center) return;

    if (!markerRef.current) {
      markerRef.current = new google.maps.Marker({
        map,
        position: center,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#dc2626",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 4,
        },
      });
    } else {
      markerRef.current.setPosition(center);
    }

    map.panTo(center);
  }, [center?.lat, center?.lng, mapReady]);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-rose-300">
        {error}
      </div>
    );
  }

  return <div ref={containerRef} className="absolute inset-0" />;
}
