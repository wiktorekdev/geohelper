import type { ConnState } from "@/types";

export type ConnectionDetails = {
  title: string;
  body: string;
  showFlags: boolean;
};

export function connectionDetails(conn: ConnState): ConnectionDetails {
  if (conn.kind === "searching" || conn.kind === "idle") {
    return {
      title: "Looking for GeoGuessr",
      body: "Start GeoGuessr on Steam and open a round.",
      showFlags: false,
    };
  }

  if (conn.kind !== "disconnected") {
    return {
      title: "Not connected",
      body: "Start GeoGuessr on Steam and open a round.",
      showFlags: false,
    };
  }

  if (conn.reason.includes("CDP port is not reachable")) {
    return {
      title: "Launch flags missing",
      body: "GeoGuessr is not exposing localhost:9222 yet.",
      showFlags: true,
    };
  }

  if (conn.reason.includes("GeoGuessr is not active")) {
    return {
      title: "GeoGuessr is not active",
      body: "Start GeoGuessr on Steam or open an active game round.",
      showFlags: false,
    };
  }

  return {
    title: "Connection lost",
    body: conn.reason,
    showFlags: false,
  };
}

export function connectionTone(conn: ConnState): { tone: "ok" | "warn" | "bad"; title: string } {
  switch (conn.kind) {
    case "connected":
      return { tone: "ok", title: "Connected to GeoGuessr" };
    case "searching":
      return { tone: "warn", title: "Looking for GeoGuessr" };
    case "disconnected":
      return { tone: "bad", title: connectionDetails(conn).title };
    default:
      return { tone: "warn", title: "Idle" };
  }
}
