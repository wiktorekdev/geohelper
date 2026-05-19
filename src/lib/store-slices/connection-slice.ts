import type { StateCreator } from "zustand";

import type { ConnState, Snapshot } from "@/types";
import type { Store } from "@/lib/store";

export type ConnectionSlice = {
  conn: ConnState;
  /** Last disconnect reason. Stays sticky across `searching` retries so the UI
   * doesn't flicker between "Connecting..." and the actual error every loop. */
  lastDisconnectReason: string | null;
  setSnapshot: (snapshot: Snapshot) => void;
  setConn: (conn: ConnState) => void;
};

function stickyReason(prev: string | null, next: ConnState): string | null {
  if (next.kind === "disconnected") return next.reason;
  if (next.kind === "connected") return null;
  return prev;
}

export const createConnectionSlice: StateCreator<Store, [], [], ConnectionSlice> = (set) => ({
  conn: { kind: "idle" },
  lastDisconnectReason: null,
  setSnapshot: (snapshot) =>
    set((s) => ({
      conn: snapshot.conn,
      current: snapshot.current,
      lastDisconnectReason: stickyReason(s.lastDisconnectReason, snapshot.conn),
    })),
  setConn: (conn) =>
    set((s) => ({
      conn,
      lastDisconnectReason: stickyReason(s.lastDisconnectReason, conn),
    })),
});
