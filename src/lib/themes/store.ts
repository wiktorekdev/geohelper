import { create } from "zustand"

import { getSettingsStore } from "../settings-persistence"
import { BUILTIN_THEMES } from "./builtin"
import type { Theme } from "./types"

const KEY_ACTIVE = "activeThemeId"

type ThemeStoreState = {
  activeId: string
  hydrated: boolean

  hydrate: () => Promise<void>
  setActive: (id: string) => void
}

export const useThemeStore = create<ThemeStoreState>((set, get) => ({
  activeId: "dark",
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return
    try {
      const settingsStore = await getSettingsStore()
      const active = await settingsStore.get<string>(KEY_ACTIVE)
      const activeId = BUILTIN_THEMES.some((theme) => theme.id === active) ? active : "dark"

      set({ activeId, hydrated: true })
    } catch {
      set({ hydrated: true })
    }
  },

  setActive: (id) => {
    if (!BUILTIN_THEMES.some((theme) => theme.id === id)) return
    set({ activeId: id })
    void persistSetting(KEY_ACTIVE, id)
  },
}))

async function persistSetting(key: string, value: unknown) {
  try {
    const store = await getSettingsStore()
    if (value === undefined) {
      await store.delete(key)
    } else {
      await store.set(key, value)
    }
    await store.save()
  } catch {
    /* ignore */
  }
}

export function selectActiveTheme(state: ThemeStoreState): Theme {
  return BUILTIN_THEMES.find((theme) => theme.id === state.activeId) ?? BUILTIN_THEMES[0]
}
