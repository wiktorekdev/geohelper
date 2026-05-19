import { useStore } from "@/lib/store";
import { localTimeFromOffset } from "@/lib/country-info";
import { InfoRow } from "./info-row";
import { Card } from "@/components/ui/card";
import { t } from "@/lib/i18n";

export function DetailsSection() {
  const details = useStore((s) => s.countryDetails);
  if (!details) return null;

  const hasAny =
    details.languages?.length ||
    details.currency ||
    details.callingCode ||
    details.timezones?.length ||
    details.capital;
  if (!hasAny) return null;

  const localTime = details.timezones?.[0]
    ? localTimeFromOffset(details.timezones[0])
    : undefined;

  return (
    <Card className="mx-4 my-2 p-3.5 space-y-1.5">
      {details.languages && details.languages.length > 0 && (
        <InfoRow
          id="details.language"
          label={t("location.language")}
          value={details.languages.slice(0, 2).join(", ")}
        />
      )}
      {details.currency && (
        <InfoRow id="details.currency" label={t("location.currency")} value={details.currency} />
      )}
      {details.callingCode && (
        <InfoRow id="details.phone" label={t("location.phone")} value={details.callingCode} />
      )}
      {localTime && <InfoRow id="details.localTime" label={t("location.localTime")} value={localTime} />}
      {details.capital && <InfoRow id="details.capital" label={t("location.capital")} value={details.capital} />}
    </Card>
  );
}
