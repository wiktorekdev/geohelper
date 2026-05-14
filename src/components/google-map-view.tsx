import { useGoogleMapInstance } from "@/hooks/use-google-map-instance";

type Props = {
  apiKey: string;
  mapTypeId: "roadmap" | "satellite" | "hybrid" | "terrain";
  center: { lat: number; lng: number } | null;
};

export function GoogleMapView({ apiKey, mapTypeId, center }: Props) {
  const { containerRef, error } = useGoogleMapInstance(apiKey, mapTypeId, center);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-rose-300">
        {error}
      </div>
    );
  }

  return <div ref={containerRef} className="absolute inset-0" />;
}
