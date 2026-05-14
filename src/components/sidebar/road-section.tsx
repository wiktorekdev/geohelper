import { useStore } from "@/lib/store";
import { InfoRow } from "./info-row";

export function RoadSection() {
  const place = useStore((s) => s.place);
  if (!place.road && !place.postcode) return null;

  return (
    <div className="px-5 py-3 space-y-1 border-t border-sidebar-border">
      {place.road && <InfoRow label="Road" value={place.road} />}
      {place.postcode && <InfoRow label="Postcode" value={place.postcode} mono />}
    </div>
  );
}
