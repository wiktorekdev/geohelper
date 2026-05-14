import { cn } from "@/lib/utils";

export function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("truncate ml-2", mono && "font-mono")}>{value}</span>
    </div>
  );
}
