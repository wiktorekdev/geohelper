import { create } from "zustand"

import { createConnectionSlice, type ConnectionSlice } from "@/lib/store-slices/connection-slice"
import { createLocationSlice, type LocationSlice } from "@/lib/store-slices/location-slice"
import {
  createSettingsSlice,
  type CopyFormat,
  type SettingsSlice,
} from "@/lib/store-slices/settings-slice"

export type { CopyFormat }

export type Store = ConnectionSlice & LocationSlice & SettingsSlice

export const useStore = create<Store>()((...args) => ({
  ...createConnectionSlice(...args),
  ...createLocationSlice(...args),
  ...createSettingsSlice(...args),
}))
