import { useStore } from "@/lib/store";
import { localTimeFromOffset } from "@/lib/country-info";
import { cn } from "@/lib/utils";

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
        <Row label="Language" value={details.languages.slice(0, 2).join(", ")} />
      )}
      {details.currency && <Row label="Currency" value={details.currency} />}
      {details.callingCode && <Row label="Phone" value={details.callingCode} />}
      {localTime && <Row label="Local time" value={localTime} />}
      {details.capital && <Row label="Capital" value={details.capital} />}
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("truncate ml-2", mono && "font-mono")}>{value}</span>
    </div>
  );
}
