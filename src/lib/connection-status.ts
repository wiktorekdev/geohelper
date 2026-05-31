import type { ConnState } from "@/types"
import { t } from "@/lib/i18n"

export type ConnectionDetails = {
  title: string
  body: string
  showFlags: boolean
}

function detailsForReason(reason: string): ConnectionDetails {
  // Order matters: NotRunning's diagnostic also contains "CDP port is not reachable",
  // so check the not-running marker first and only show the launch-flags hint when
  // the process is actually detected.
  if (
    reason.includes("GeoGuessr.exe is not running") ||
    reason.includes("GeoGuessr is not active")
  ) {
    return { title: t("connection.notRunning"), body: "", showFlags: false }
  }

  if (reason.includes("missing --remote-allow-origins")) {
    return {
      title: t("connection.noOrigins"),
      body: t("connection.body.noOrigins"),
      showFlags: true,
    }
  }

  if (reason.includes("CDP port is not reachable")) {
    return {
      title: t("connection.noPort"),
      body: t("connection.body.notExposingPort"),
      showFlags: true,
    }
  }

  return { title: t("connection.lost"), body: reason, showFlags: false }
}

export function connectionDetails(
  conn: ConnState,
  stickyReason?: string | null
): ConnectionDetails {
  // While searching/idle, prefer the last known disconnect reason so the UI
  // doesn't flap between "Connecting..." and the real cause every retry loop.
  if (conn.kind === "searching" || conn.kind === "idle") {
    if (stickyReason) return detailsForReason(stickyReason)
    return {
      title: t("connection.connecting"),
      body: t("connection.body.startGame"),
      showFlags: false,
    }
  }

  if (conn.kind === "disconnected") return detailsForReason(conn.reason)

  return {
    title: t("connection.unknown"),
    body: t("connection.body.startGame"),
    showFlags: false,
  }
}

export function connectionTone(
  conn: ConnState,
  stickyReason?: string | null
): { tone: "ok" | "warn" | "bad"; title: string } {
  switch (conn.kind) {
    case "connected":
      return { tone: "ok", title: t("connection.connected") }
    case "searching":
      return { tone: "warn", title: connectionDetails(conn, stickyReason).title }
    case "disconnected":
      return { tone: "bad", title: connectionDetails(conn, stickyReason).title }
    default:
      return { tone: "warn", title: t("connection.idle") }
  }
}
