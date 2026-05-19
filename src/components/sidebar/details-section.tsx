import { useStore } from "@/lib/store";
import { localTimeFromOffset } from "@/lib/country-info";
import { InfoRow } from "./info-row";
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
    <div className="px-5 py-3 space-y-1 border-t border-sidebar-border">
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
    </div>
  );
}
