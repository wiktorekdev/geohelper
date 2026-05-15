import type { ConnState } from "@/types";
import { connectionDetails } from "@/lib/connection-status";

export function EmptyState({ conn }: { conn: ConnState }) {
  const details = connectionDetails(conn);

  if (conn.kind === "connected") {
    return (
      <div className="flex flex-1 items-center justify-center py-16 text-xs text-muted-foreground">
        Waiting for a round...
      </div>
    );
  }

  return (
    <div className="space-y-3 px-5 py-10 text-center">
      <div className="text-sm font-medium">{details.title}</div>
      <div className="text-xs text-muted-foreground">{details.body}</div>
      {details.showFlags && (
        <div className="mx-auto max-w-[260px] rounded-md border border-sidebar-border bg-background/50 p-3 text-left text-[11px] leading-relaxed text-muted-foreground">
          Add these Steam launch options:
          <code className="mt-1.5 block break-all rounded bg-accent px-2 py-1 font-mono text-[10px]">
            --remote-debugging-port=9222
          </code>
        </div>
      )}
    </div>
  );
}
