import { useEffect, useRef, useState } from "react"

import { loadGoogleMaps } from "@/lib/google-maps-loader"
import { useStore } from "@/lib/store"

const DEFAULT_CENTER = { lat: 20, lng: 0 }
const DEFAULT_ZOOM = 2

type MapCenter = { lat: number; lng: number } | null

function createGoogleMarkerIcon(
  markerColor: string,
  markerBorderColor: string,
  markerSize: number
): google.maps.Symbol {
  const scale = markerSize / 2.4
  const strokeWeight = Math.max(2, Math.round(markerSize / 8))

  return {
    path: google.maps.SymbolPath.CIRCLE,
    scale,
    fillColor: markerColor,
    fillOpacity: 1,
    strokeColor: markerBorderColor,
    strokeWeight,
  }
}

export function useGoogleMapInstance(
  apiKey: string,
  mapTypeId: "roadmap" | "satellite" | "hybrid" | "terrain",
  styles: google.maps.MapTypeStyle[] | undefined,
  center: MapCenter
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [mapReady, setMapReady] = useState(false)

  const markerColor = useStore((s) => s.markerColor)
  const markerBorderColor = useStore((s) => s.markerBorderColor)
  const markerSize = useStore((s) => s.markerSize)

  useEffect(() => {
    let cancelled = false
    mapRef.current = null
    markerRef.current = null
    containerRef.current?.replaceChildren()
    queueMicrotask(() => {
      setMapReady(false)
      setError(null)
    })

    loadGoogleMaps(apiKey)
      .then(() => {
        if (cancelled || !containerRef.current) return
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
        })
        setMapReady(true)
      })
      .catch((loadError) => {
        if (!cancelled) setError(loadError.message)
      })

    return () => {
      cancelled = true
    }
  }, [apiKey, mapTypeId, styles])

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setMapTypeId(mapTypeId)
      mapRef.current.setOptions({ styles })
    }
  }, [mapTypeId, styles])

  useEffect(() => {
    const map = mapRef.current
    if (!mapReady || !map) return

    if (!center) {
      if (markerRef.current) {
        google.maps.event.clearInstanceListeners(markerRef.current)
        markerRef.current.setMap(null)
        markerRef.current = null
      }
      map.panTo(DEFAULT_CENTER)
      map.setZoom(DEFAULT_ZOOM)
      return
    }

    const icon = createGoogleMarkerIcon(markerColor, markerBorderColor, markerSize)

    if (!markerRef.current) {
      const marker = new google.maps.Marker({
        map,
        position: center,
        cursor: "default",
        icon,
      })

      markerRef.current = marker
    } else {
      markerRef.current.setPosition(center)
      markerRef.current.setCursor("default")
      markerRef.current.setIcon(icon)
      markerRef.current.setMap(map)
    }

    map.panTo(center)
  }, [center, mapReady, markerColor, markerBorderColor, markerSize])

  return { containerRef, error }
}
