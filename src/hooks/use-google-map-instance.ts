import { useEffect, useRef, useState } from "react";

import { loadGoogleMaps } from "@/lib/google-maps-loader";
import { useStore } from "@/lib/store";
import { useDisplayStore } from "@/lib/display-store";
import { t } from "@/lib/i18n";

const DEFAULT_CENTER = { lat: 20, lng: 0 };
const DEFAULT_ZOOM = 2;

type MapCenter = { lat: number; lng: number } | null;

export function useGoogleMapInstance(
  apiKey: string,
  mapTypeId: "roadmap" | "satellite" | "hybrid" | "terrain",
  styles: google.maps.MapTypeStyle[] | undefined,
  center: MapCenter,
  onMarkerClick?: () => void,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const markerColor = useStore((s) => s.markerColor);
  const markerBorderColor = useStore((s) => s.markerBorderColor);
  const markerSize = useStore((s) => s.markerSize);
  const editing = useDisplayStore((s) => s.editing);

  const clickRef = useRef(onMarkerClick);
  const editingRef = useRef(editing);

  useEffect(() => {
    clickRef.current = onMarkerClick;
    editingRef.current = editing;
  }, [onMarkerClick, editing]);

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
          styles,
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
  }, [apiKey, mapTypeId, styles]);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setMapTypeId(mapTypeId);
      mapRef.current.setOptions({ styles });
    }
  }, [mapTypeId, styles]);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map) return;

    if (!center) {
      if (markerRef.current) {
        google.maps.event.clearInstanceListeners(markerRef.current);
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      map.panTo(DEFAULT_CENTER);
      map.setZoom(DEFAULT_ZOOM);
      return;
    }

    const scale = markerSize / 2.4;
    const strokeWeight = Math.max(2, Math.round(markerSize / 8));

    if (!markerRef.current) {
      const marker = new google.maps.Marker({
        map,
        position: center,
        cursor: editing ? "pointer" : "default",
        title: editing ? t("marker.customizeTitle") : undefined,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale,
          fillColor: markerColor,
          fillOpacity: 1,
          strokeColor: markerBorderColor,
          strokeWeight,
        },
      });

      marker.addListener("click", () => {
        if (editingRef.current && clickRef.current) {
          clickRef.current();
        }
      });

      markerRef.current = marker;
    } else {
      markerRef.current.setPosition(center);
      markerRef.current.setCursor(editing ? "pointer" : "default");
      markerRef.current.setTitle(editing ? t("marker.customizeTitle") : undefined);
      markerRef.current.setIcon({
        path: google.maps.SymbolPath.CIRCLE,
        scale,
        fillColor: markerColor,
        fillOpacity: 1,
        strokeColor: markerBorderColor,
        strokeWeight,
      });
      markerRef.current.setMap(map);
    }

    map.panTo(center);
  }, [center, mapReady, markerColor, markerBorderColor, markerSize, editing]);

  return { containerRef, error };
}