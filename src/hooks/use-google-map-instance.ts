import { useEffect, useRef, useState } from "react";

import { loadGoogleMaps } from "@/lib/google-maps-loader";

const DEFAULT_CENTER = { lat: 20, lng: 0 };
const DEFAULT_ZOOM = 2;

type MapCenter = { lat: number; lng: number } | null;

export function useGoogleMapInstance(
  apiKey: string,
  mapTypeId: "roadmap" | "satellite" | "hybrid" | "terrain",
  center: MapCenter,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    mapRef.current = null;
    markerRef.current = null;
    containerRef.current?.replaceChildren();
    setMapReady(false);
    setError(null);

    loadGoogleMaps(apiKey)
      .then(() => {
        if (cancelled || !containerRef.current) return;
        mapRef.current = new google.maps.Map(containerRef.current, {
          center: DEFAULT_CENTER,
          zoom: DEFAULT_ZOOM,
          mapTypeId,
          disableDefaultUI: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          clickableIcons: false,
          gestureHandling: "greedy",
          zoomControl: false,
        });
        setMapReady(true);
      })
      .catch((loadError) => {
        if (!cancelled) setError(loadError.message);
      });

    return () => {
      cancelled = true;
    };
  }, [apiKey, mapTypeId]);

  useEffect(() => {
    mapRef.current?.setMapTypeId(mapTypeId);
  }, [mapTypeId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map) return;

    if (!center) {
      markerRef.current?.setMap(null);
      markerRef.current = null;
      map.panTo(DEFAULT_CENTER);
      map.setZoom(DEFAULT_ZOOM);
      return;
    }

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
      markerRef.current.setMap(map);
    }

    map.panTo(center);
  }, [center, mapReady]);

  return { containerRef, error };
}