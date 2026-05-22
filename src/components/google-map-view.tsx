import { useGoogleMapInstance } from "@/hooks/use-google-map-instance"

type Props = {
  apiKey: string
  mapTypeId: "roadmap" | "satellite" | "hybrid" | "terrain"
  styles?: google.maps.MapTypeStyle[]
  center: { lat: number; lng: number } | null
}

export function GoogleMapView({ apiKey, mapTypeId, styles, center }: Props) {
  const { containerRef, error } = useGoogleMapInstance(apiKey, mapTypeId, styles, center)

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-rose-300">{error}</div>
    )
  }

  return <div ref={containerRef} className="absolute inset-0" />
}
