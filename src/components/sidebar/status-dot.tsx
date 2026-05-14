import type { ConnState } from "@/types";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { connectionTone } from "@/lib/connection-status";
import { cn } from "@/lib/utils";

export function StatusDot({ conn }: { conn: ConnState }) {
  const { tone, title } = connectionTone(conn);
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            "mr-1 inline-block size-1.5 rounded-full",
            tone === "ok" && "bg-emerald-500",
            tone === "warn" && "bg-amber-500 animate-pulse",
            tone === "bad" && "bg-rose-500",
          )}
        />
      </TooltipTrigger>
      <TooltipContent side="bottom">{title}</TooltipContent>
    </Tooltip>
  );
}
