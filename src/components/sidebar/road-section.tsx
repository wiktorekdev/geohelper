import { useStore } from "@/lib/store";
import { InfoRow } from "./info-row";
import { t } from "@/lib/i18n";

export function RoadSection() {
  const place = useStore((s) => s.place);
  if (!place.road && !place.postcode) return null;

  return (
    <div className="px-5 py-3 space-y-1 border-t border-sidebar-border">
      {place.road && <InfoRow id="road.road" label={t("location.road")} value={place.road} />}
      {place.postcode && (
        <InfoRow id="road.postcode" label={t("location.postcode")} value={place.postcode} mono />
      )}
    </div>
  );
}
