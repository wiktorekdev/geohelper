import type { ConnState } from "@/types";
import { connectionDetails } from "@/lib/connection-status";
import { useStore } from "@/lib/store";
import { t } from "@/lib/i18n";

export function EmptyState({ conn }: { conn: ConnState }) {
  const sticky = useStore((s) => s.lastDisconnectReason);
  const details = connectionDetails(conn, sticky);

  if (conn.kind === "connected") {
    return (
      <div className="flex flex-1 items-center justify-center py-16 text-xs text-muted-foreground">
        {t("sidebar.waitingForRound")}
      </div>
    );
  }

  return (
    <div className="space-y-3 px-5 py-10 text-center">
      <div className="text-sm font-medium">{details.title}</div>
      {details.body && (
        <div className="text-xs text-muted-foreground">{details.body}</div>
      )}
      {details.showFlags && (
        <div className="mx-auto max-w-[260px] rounded-md border border-sidebar-border bg-background/50 p-3 text-left text-[11px] leading-relaxed text-muted-foreground">
          {t("sidebar.addSteamLaunchOptions")}
          <code className="mt-1.5 block break-all rounded bg-accent px-2 py-1 font-mono text-[10px]">
            --remote-debugging-port=9222
          </code>
        </div>
      )}
    </div>
  );
}
