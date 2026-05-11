import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function RoadSection() {
  const place = useStore((s) => s.place);
  if (!place.road && !place.postcode) return null;

  return (
    <div className="px-5 py-3 space-y-1 border-t border-sidebar-border">
      {place.road && <Row label="Road" value={place.road} />}
      {place.postcode && <Row label="Postcode" value={place.postcode} mono />}
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
