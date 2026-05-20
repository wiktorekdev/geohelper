import { m } from "framer-motion";

import type { ConnState } from "@/types";
import { connectionDetails } from "@/lib/connection-status";
import { useStore } from "@/lib/store";
import { t } from "@/lib/i18n";

export function EmptyState({ conn }: { conn: ConnState }) {
  const sticky = useStore((s) => s.lastDisconnectReason);
  const details = connectionDetails(conn, sticky);

  if (conn.kind === "connected") {
    return (
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="flex flex-1 items-center justify-center py-16 text-xs text-muted-foreground"
      >
        {t("sidebar.waitingForRound")}
      </m.div>
    );
  }

  return (
    <m.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
      className="space-y-3 px-5 py-10 text-center"
    >
      <div className="text-sm font-medium">{details.title}</div>
      {details.body && (
        <div className="text-xs text-muted-foreground">{details.body}</div>
      )}
      {details.showFlags && (
        <m.div
          initial={{ opacity: 0, scale: 0.95, y: 5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.22, ease: "easeOut" }}
          className="mx-auto max-w-[260px] rounded-md border border-sidebar-border bg-background/50 p-3 text-left text-[11px] leading-relaxed text-muted-foreground"
        >
          {t("sidebar.addSteamLaunchOptions")}
          <code className="mt-1.5 block break-all rounded bg-accent px-2 py-1 font-mono text-[10px]">
            --remote-debugging-port=9222
          </code>
        </m.div>
      )}
    </m.div>
  );
}
