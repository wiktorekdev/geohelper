import { create } from "zustand"
import { t } from "@/lib/i18n"
import { getSettingsStore } from "./settings-persistence"
import { logger } from "./logger"
import { createDebouncedWriter } from "./debounced-writer"
import {
  applySelectionStyle,
  dedupeTextIds,
  normalizeTextStyle,
  resetSelectedStyles,
  resetWidgetTextState,
  selectRegisteredWidgetTexts,
  setSelectionHiddenState,
  type TextStyle,
} from "./display-selection"

export {
  DEFAULT_TEXT_STYLE,
  MAX_TEXT_SIZE,
  MIN_TEXT_SIZE,
  TEXT_FONT_OPTIONS,
  normalizeTextFont,
  normalizeTextSize,
  textStyleToCss,
} from "./display-selection"

export type { TextFont, TextStyle } from "./display-selection"

export const SIDEBAR_MIN_WIDTH = 320
export const SIDEBAR_MAX_WIDTH = 700
export const SIDEBAR_DEFAULT_WIDTH = 320

export type WidgetId = "country" | "road" | "details" | "coordinates"

export type DisplayConfig = {
  order: WidgetId[]
  textStyles: Record<string, TextStyle>
  hiddenTexts: Record<string, true>
  mapVisible: boolean
  sidebarWidth: number
}

export type DisplayResetOptions = {
  order?: boolean
  text?: boolean
  visibility?: boolean
  panel?: boolean
}

const ALL_WIDGETS: WidgetId[] = ["country", "road", "details", "coordinates"]

/** Resolve a widget label at call-time so locale switches take effect. */
export function widgetLabel(id: WidgetId): string {
  return t(`widget.${id}`)
}

const DEFAULT_CONFIG: DisplayConfig = {
  order: [...ALL_WIDGETS],
  textStyles: {},
  hiddenTexts: {},
  mapVisible: true,
  sidebarWidth: SIDEBAR_DEFAULT_WIDTH,
}

const KNOWN_WIDGETS = new Set<WidgetId>(ALL_WIDGETS)
const DISPLAY_SAVE_DELAY_MS = 250

function cloneDefault(): DisplayConfig {
  return {
    order: [...DEFAULT_CONFIG.order],
    textStyles: {},
    hiddenTexts: {},
    mapVisible: DEFAULT_CONFIG.mapVisible,
    sidebarWidth: DEFAULT_CONFIG.sidebarWidth,
  }
}

function normalizeDisplayConfig(raw: unknown): DisplayConfig {
  if (!raw || typeof raw !== "object") return cloneDefault()
  const parsed = raw as Partial<DisplayConfig>

  const order = Array.isArray(parsed.order) ? parsed.order.filter(isWidgetId) : []
  const ordered = new Set(order)
  for (const widget of ALL_WIDGETS) {
    if (!ordered.has(widget)) order.push(widget)
  }

  const textStyles: Record<string, TextStyle> = {}
  if (parsed.textStyles && typeof parsed.textStyles === "object") {
    for (const [key, value] of Object.entries(parsed.textStyles as Record<string, unknown>)) {
      const normalized = normalizeTextStyle(value)
      if (normalized) textStyles[key] = normalized
    }
  }

  const hiddenTexts: Record<string, true> = {}
  if (parsed.hiddenTexts && typeof parsed.hiddenTexts === "object") {
    for (const [key, value] of Object.entries(parsed.hiddenTexts as Record<string, unknown>)) {
      if (value === true) hiddenTexts[key] = true
    }
  }

  const sidebarWidth =
    typeof parsed.sidebarWidth === "number" && Number.isFinite(parsed.sidebarWidth)
      ? clampSidebar(parsed.sidebarWidth)
      : SIDEBAR_DEFAULT_WIDTH

  return {
    order,
    textStyles,
    hiddenTexts,
    mapVisible: typeof parsed.mapVisible === "boolean" ? parsed.mapVisible : true,
    sidebarWidth,
  }
}

function isWidgetId(value: unknown): value is WidgetId {
  return typeof value === "string" && KNOWN_WIDGETS.has(value as WidgetId)
}

function clampSidebar(value: number): number {
  return Math.max(SIDEBAR_MIN_WIDTH, Math.min(SIDEBAR_MAX_WIDTH, Math.round(value)))
}

async function persistDisplayConfig(state: DisplayConfig) {
  try {
    const store = await getSettingsStore()
    await store.set("displayConfig", {
      order: state.order,
      textStyles: state.textStyles,
      hiddenTexts: state.hiddenTexts,
      mapVisible: state.mapVisible,
      sidebarWidth: state.sidebarWidth,
    })
    await store.save()
  } catch (e) {
    logger.error("Failed to save display config:", e)
  }
}

function snapshotDisplayConfig(state: DisplayConfig): DisplayConfig {
  return {
    order: [...state.order],
    textStyles: { ...state.textStyles },
    hiddenTexts: { ...state.hiddenTexts },
    mapVisible: state.mapVisible,
    sidebarWidth: state.sidebarWidth,
  }
}

const displayWriter = createDebouncedWriter(persistDisplayConfig, DISPLAY_SAVE_DELAY_MS)

function saveDisplayConfig(state: DisplayConfig) {
  void displayWriter.save(snapshotDisplayConfig(state))
}

function scheduleDisplayConfig(state: DisplayConfig) {
  displayWriter.schedule(snapshotDisplayConfig(state))
}

type DisplayStore = DisplayConfig & {
  editing: boolean
  resizing: boolean
  markerToolbarOpen: boolean
  selection: string[]
  registeredIds: Record<string, true>

  hydrate: () => Promise<void>
  toggleEditing: () => void
  stopEditing: () => void
  setResizing: (resizing: boolean) => void
  setMarkerToolbarOpen: (open: boolean) => void
  setOrder: (order: WidgetId[]) => void
  setMapVisible: (visible: boolean) => void
  setSidebarWidth: (width: number) => void
  registerText: (id: string) => void
  unregisterText: (id: string) => void

  setSelection: (ids: string[]) => void
  addToSelection: (ids: string[]) => void
  toggleSelection: (id: string) => void
  clearSelection: () => void
  selectWidget: (widget: WidgetId, additive?: boolean) => void

  setSelectionStyle: (patch: Partial<TextStyle>) => void
  setSelectionHidden: (hidden: boolean) => void
  resetSelection: () => void
  resetWidget: (id: WidgetId) => void
  resetParts: (options: DisplayResetOptions) => void
  resetAll: () => void
}

export const useDisplayStore = create<DisplayStore>((set, get) => ({
  ...cloneDefault(),
  editing: false,
  resizing: false,
  markerToolbarOpen: false,
  selection: [],
  registeredIds: {},

  hydrate: async () => {
    try {
      const store = await getSettingsStore()
      const stored = await store.get<unknown>("displayConfig")
      if (stored) {
        set(normalizeDisplayConfig(stored))
      }
    } catch (e) {
      logger.error("Failed to hydrate display store:", e)
    }
  },

  registerText: (id) => {
    if (get().registeredIds[id]) return
    set({ registeredIds: { ...get().registeredIds, [id]: true } })
  },
  unregisterText: (id) => {
    if (!get().registeredIds[id]) return
    const next = { ...get().registeredIds }
    delete next[id]
    set({ registeredIds: next })
  },

  toggleEditing: () => {
    const editing = !get().editing
    set({ editing, selection: [] })
  },
  stopEditing: () => set({ editing: false, selection: [] }),
  setResizing: (resizing) => set({ resizing }),
  setMarkerToolbarOpen: (markerToolbarOpen) => set({ markerToolbarOpen }),

  setOrder: (order) => {
    set({ order })
    saveDisplayConfig(get())
  },
  setMapVisible: (mapVisible) => {
    set({ mapVisible })
    saveDisplayConfig(get())
  },
  setSidebarWidth: (width) => {
    const sidebarWidth = clampSidebar(width)
    if (sidebarWidth === get().sidebarWidth) return
    set({ sidebarWidth })
    scheduleDisplayConfig(get())
  },

  setSelection: (ids) => set({ selection: dedupeTextIds(ids) }),
  addToSelection: (ids) => set({ selection: dedupeTextIds([...get().selection, ...ids]) }),
  toggleSelection: (id) => {
    const current = get().selection
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
    set({ selection: next })
  },
  clearSelection: () => set({ selection: [] }),
  selectWidget: (widget, additive = false) => {
    const { registeredIds, selection } = get()
    set({ selection: selectRegisteredWidgetTexts(registeredIds, widget, selection, additive) })
  },

  setSelectionStyle: (patch) => {
    const { selection, textStyles } = get()
    if (selection.length === 0) return
    set({ textStyles: applySelectionStyle(textStyles, selection, patch) })
    scheduleDisplayConfig(get())
  },
  setSelectionHidden: (hidden) => {
    const { selection, hiddenTexts } = get()
    if (selection.length === 0) return
    set({ hiddenTexts: setSelectionHiddenState(hiddenTexts, selection, hidden) })
    saveDisplayConfig(get())
  },
  resetSelection: () => {
    const { selection, textStyles } = get()
    if (selection.length === 0) return
    set({ textStyles: resetSelectedStyles(textStyles, selection) })
    saveDisplayConfig(get())
  },
  resetWidget: (id) => {
    const { textStyles, hiddenTexts, selection } = get()
    set(resetWidgetTextState(id, textStyles, hiddenTexts, selection))
    saveDisplayConfig(get())
  },
  resetParts: (options) => {
    const current = get()
    const next: DisplayConfig = {
      order: options.order ? [...DEFAULT_CONFIG.order] : current.order,
      textStyles: options.text ? {} : current.textStyles,
      hiddenTexts: options.visibility ? {} : current.hiddenTexts,
      mapVisible: options.panel ? DEFAULT_CONFIG.mapVisible : current.mapVisible,
      sidebarWidth: options.panel ? DEFAULT_CONFIG.sidebarWidth : current.sidebarWidth,
    }
    set({ ...next, selection: [] })
    saveDisplayConfig(next)
  },
  resetAll: () => {
    const fresh = cloneDefault()
    set({ ...fresh, selection: [] })
    saveDisplayConfig(fresh)
  },
}))
