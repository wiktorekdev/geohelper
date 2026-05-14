import { useStore } from "@/lib/store";
import { localTimeFromOffset } from "@/lib/country-info";
import { InfoRow } from "./info-row";

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
        <InfoRow label="Language" value={details.languages.slice(0, 2).join(", ")} />
      )}
      {details.currency && <InfoRow label="Currency" value={details.currency} />}
      {details.callingCode && <InfoRow label="Phone" value={details.callingCode} />}
      {localTime && <InfoRow label="Local time" value={localTime} />}
      {details.capital && <InfoRow label="Capital" value={details.capital} />}
    </div>
  );
}
