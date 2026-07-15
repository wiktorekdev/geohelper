import { m } from "motion/react"
import { Gamepad2, Loader2, Unplug } from "lucide-react"

import type { ConnState } from "@/types"
import { connectionDetails } from "@/lib/connection-status"
import { useStore } from "@/lib/store"
import { useT } from "@/lib/i18n"

function stateVisual(conn: ConnState) {
  if (conn.kind === "searching")
    return (
      <div className="flex size-12 items-center justify-center rounded-xl bg-brand/10">
        <Loader2 className="size-5 animate-spin text-brand" />
      </div>
    )
  if (
    conn.kind === "disconnected" &&
    (conn.reason.includes("not running") || conn.reason.includes("not active"))
  )
    return (
      <div className="flex size-12 items-center justify-center rounded-xl bg-white/[0.04]">
        <Gamepad2 className="size-5 text-muted-foreground/50" />
      </div>
    )
  return (
    <div className="flex size-12 items-center justify-center rounded-xl bg-white/[0.04]">
      <Unplug className="size-5 text-muted-foreground/50" />
    </div>
  )
}

export function EmptyState({ conn }: { conn: ConnState }) {
  const t = useT()
  const sticky = useStore((s) => s.lastDisconnectReason)
  const details = connectionDetails(conn, sticky)

  if (conn.kind === "connected") {
    return (
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="flex flex-1 flex-col items-center justify-center px-5 py-16"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-xl bg-brand/10">
            <Gamepad2 className="size-5 text-brand" />
          </div>
          <div className="space-y-1 text-center">
            <div className="text-[13px] font-medium">{t("sidebar.waitingForRound")}</div>
            <div className="text-[11px] text-muted-foreground">
              Start a game to see location data
            </div>
          </div>
        </div>
      </m.div>
    )
  }

  return (
    <m.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
      className="flex flex-1 flex-col items-center justify-center px-5 py-14"
    >
      <div className="flex flex-col items-center gap-4">
        {stateVisual(conn)}
        <div className="space-y-1 text-center">
          <div className="text-[13px] font-medium">{details.title}</div>
          {details.body ? (
            <div className="text-[11px] text-muted-foreground leading-relaxed">{details.body}</div>
          ) : (
            <div className="text-[11px] text-muted-foreground">Launch the game to get started</div>
          )}
        </div>
      </div>
      {details.showFlags && (
        <m.div
          initial={{ opacity: 0, scale: 0.95, y: 5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.22, ease: "easeOut" }}
          className="mx-auto mt-4 max-w-[260px] rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-left text-[11px] leading-relaxed text-muted-foreground"
        >
          {t("sidebar.addSteamLaunchOptions")}
          <code className="mt-1.5 block break-all rounded bg-white/[0.04] px-2 py-1 font-mono text-[10px]">
            --remote-debugging-port=34788 --remote-allow-origins=*
          </code>
        </m.div>
      )}
    </m.div>
  )
}
