import { create } from "zustand";
import { Store as TauriStore } from "@tauri-apps/plugin-store";

import { BUILTIN_THEMES } from "./builtin";
import type { Theme } from "./types";

/**
 * Theme persistence layout (`%APPDATA%/dev.geohelper.desktop/themes.json`):
 *
 *   {
 *     "active": "femboy",
 *     "userThemes": [{...Theme}],
 *     "hiddenBuiltins": ["mocha"]
 *   }
 *
 * Built-in themes always come from `BUILTIN_THEMES` in code so updates ship
 * new presets automatically without overwriting anything on disk.
 */

const STORE_FILE = "themes.json";
const KEY_ACTIVE = "active";
const KEY_USER = "userThemes";
const KEY_HIDDEN = "hiddenBuiltins";
const LEGACY_THEME_KEY = "geohelper.theme";

let storePromise: Promise<TauriStore> | null = null;
function getStore() {
  storePromise ??= TauriStore.load(STORE_FILE, { defaults: {}, autoSave: true });
  return storePromise;
}

type ThemeStoreState = {
  /** Currently active theme id. Always resolvable to a theme. */
  activeId: string;
  /** User-defined themes loaded from disk. */
  userThemes: Theme[];
  /** Built-in IDs the user has chosen to hide from the picker. */
  hiddenBuiltins: string[];
  /** True once we've loaded persisted state at least once. */
  hydrated: boolean;

  hydrate: () => Promise<void>;
  setActive: (id: string) => void;
  setBuiltinHidden: (id: string, hidden: boolean) => void;
};

function readLegacyMode(): "dark" | "light" | null {
  try {
    const raw = localStorage.getItem(LEGACY_THEME_KEY);
    if (raw === "dark" || raw === "light") return raw;
  } catch {
    /* ignore */
  }
  return null;
}

export const useThemeStore = create<ThemeStoreState>((set, get) => ({
  activeId: readLegacyMode() ?? "dark",
  userThemes: [],
  hiddenBuiltins: [],
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;
    try {
      const store = await getStore();
      const [active, user, hidden] = await Promise.all([
        store.get<string>(KEY_ACTIVE),
        store.get<Theme[]>(KEY_USER),
        store.get<string[]>(KEY_HIDDEN),
      ]);
      set({
        activeId: typeof active === "string" ? active : get().activeId,
        userThemes: Array.isArray(user) ? user.filter(isTheme) : [],
        hiddenBuiltins: Array.isArray(hidden) ? hidden.filter((s) => typeof s === "string") : [],
        hydrated: true,
      });
    } catch {
      set({ hydrated: true });
    }
  },

  setActive: (id) => {
    set({ activeId: id });
    void persist({ [KEY_ACTIVE]: id });
  },

  setBuiltinHidden: (id, hidden) => {
    const set1 = new Set(get().hiddenBuiltins);
    if (hidden) set1.add(id);
    else set1.delete(id);
    const hiddenBuiltins = Array.from(set1);
    set({ hiddenBuiltins });
    void persist({ [KEY_HIDDEN]: hiddenBuiltins });
  },
}));

async function persist(values: Record<string, unknown>) {
  try {
    const store = await getStore();
    for (const [key, value] of Object.entries(values)) {
      if (value === undefined || (Array.isArray(value) && value.length === 0)) {
        await store.delete(key);
      } else {
        await store.set(key, value);
      }
    }
  } catch {
    /* persistence failures shouldn't break the UI */
  }
}

function isTheme(value: unknown): value is Theme {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<Theme>;
  return typeof v.id === "string" && typeof v.name === "string" && (v.mode === "dark" || v.mode === "light");
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
  const fromUser = state.userThemes.find((t) => t.id === state.activeId);
  if (fromUser) return fromUser;
  const fromBuiltin = BUILTIN_THEMES.find((t) => t.id === state.activeId);
  return fromBuiltin ?? BUILTIN_THEMES[0];
}
