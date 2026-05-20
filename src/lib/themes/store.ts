import { create } from "zustand"
import { Store as TauriStore } from "@tauri-apps/plugin-store"
import { invoke } from "@tauri-apps/api/core"

import { getSettingsStore } from "../settings-persistence"
import { BUILTIN_THEMES } from "./builtin"
import { logger } from "../logger"
import type { Theme } from "./types"

const KEY_ACTIVE = "activeThemeId"
const KEY_USER = "userThemes"
const KEY_HIDDEN = "hiddenBuiltins"

let themesStoreInstance: TauriStore | null = null
let themesStorePromise: Promise<TauriStore> | null = null

function getThemesStore(): Promise<TauriStore> {
  if (themesStoreInstance) {
    return Promise.resolve(themesStoreInstance)
  }
  if (!themesStorePromise) {
    themesStorePromise = (async () => {
      const storePath = await invoke<string>("get_store_path", { filename: "themes.json" })
      try {
        const store = await TauriStore.load(storePath, { defaults: {}, autoSave: true })
        themesStoreInstance = store
        return store
      } catch (e) {
        logger.error(`Failed to load themes store at ${storePath}, attempting recovery:`, e)
        await invoke("handle_corrupted_store", { path: storePath })
        const store = await TauriStore.load(storePath, { defaults: {}, autoSave: true })
        themesStoreInstance = store
        return store
      }
    })()
  }
  return themesStorePromise
}

type ThemeStoreState = {
  /** Currently active theme id. Always resolvable to a theme. */
  activeId: string
  /** User-defined themes loaded from disk. */
  userThemes: Theme[]
  /** Built-in IDs the user has chosen to hide from the picker. */
  hiddenBuiltins: string[]
  /** True once we've loaded persisted state at least once. */
  hydrated: boolean

  hydrate: () => Promise<void>
  setActive: (id: string) => void
  setBuiltinHidden: (id: string, hidden: boolean) => void
}

export const useThemeStore = create<ThemeStoreState>((set, get) => ({
  activeId: "dark",
  userThemes: [],
  hiddenBuiltins: [],
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return
    try {
      const settingsStore = await getSettingsStore()
      const themesStore = await getThemesStore()

      const active = await settingsStore.get<string>(KEY_ACTIVE)
      const user = await themesStore.get<Theme[]>(KEY_USER)
      const hidden = await themesStore.get<string[]>(KEY_HIDDEN)

      set({
        activeId: typeof active === "string" ? active : "dark",
        userThemes: Array.isArray(user) ? user.filter(isTheme) : [],
        hiddenBuiltins: Array.isArray(hidden) ? hidden.filter((s) => typeof s === "string") : [],
        hydrated: true,
      })
    } catch {
      set({ hydrated: true })
    }
  },

  setActive: (id) => {
    set({ activeId: id })
    void persistSetting(KEY_ACTIVE, id)
  },

  setBuiltinHidden: (id, hidden) => {
    const set1 = new Set(get().hiddenBuiltins)
    if (hidden) set1.add(id)
    else set1.delete(id)
    const hiddenBuiltins = Array.from(set1)
    set({ hiddenBuiltins })
    void persistThemeSetting(KEY_HIDDEN, hiddenBuiltins)
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

async function persistThemeSetting(key: string, value: unknown) {
  try {
    const store = await getThemesStore()
    if (value === undefined || (Array.isArray(value) && value.length === 0)) {
      await store.delete(key)
    } else {
      await store.set(key, value)
    }
    await store.save()
  } catch {
    /* ignore */
  }
}

function isTheme(value: unknown): value is Theme {
  if (!value || typeof value !== "object") return false
  const v = value as Partial<Theme>
  return (
    typeof v.id === "string" &&
    typeof v.name === "string" &&
    (v.mode === "dark" || v.mode === "light")
  )
}

/**
 * Resolve the active theme, falling back to "dark" if the active id is gone.
 *
 * Returns a stable reference (existing object from `BUILTIN_THEMES` or
 * `userThemes`) so it's safe to use directly with `useThemeStore`. Selectors
 * that allocate new arrays/objects must be memoized at the call site to avoid
 * `useSyncExternalStore` infinite loops.
 */
export function selectActiveTheme(state: ThemeStoreState): Theme {
  const fromUser = state.userThemes.find((t) => t.id === state.activeId)
  if (fromUser) return fromUser
  const fromBuiltin = BUILTIN_THEMES.find((t) => t.id === state.activeId)
  return fromBuiltin ?? BUILTIN_THEMES[0]
}
