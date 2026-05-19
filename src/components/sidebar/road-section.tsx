import { useStore } from "@/lib/store";
import { InfoRow } from "./info-row";
import { Card } from "@/components/ui/card";
import { t } from "@/lib/i18n";

export function RoadSection() {
  const place = useStore((s) => s.place);
  if (!place.road && !place.postcode) return null;

  return (
    <Card className="mx-4 my-2 p-3.5 space-y-1.5">
      {place.road && <InfoRow id="road.road" label={t("location.road")} value={place.road} />}
      {place.postcode && (
        <InfoRow id="road.postcode" label={t("location.postcode")} value={place.postcode} mono />
      )}
    </Card>
  );
}
