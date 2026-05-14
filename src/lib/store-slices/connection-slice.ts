import type { StateCreator } from "zustand";

import type { ConnState, Snapshot } from "@/types";
import type { Store } from "@/lib/store";

export type ConnectionSlice = {
  conn: ConnState;
  setSnapshot: (snapshot: Snapshot) => void;
  setConn: (conn: ConnState) => void;
};

export const createConnectionSlice: StateCreator<Store, [], [], ConnectionSlice> = (set) => ({
  conn: { kind: "idle" },
  setSnapshot: (snapshot) => set({ conn: snapshot.conn, current: snapshot.current }),
  setConn: (conn) => set({ conn }),
});
