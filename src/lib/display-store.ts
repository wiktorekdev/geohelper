import { create } from "zustand";

export const SIDEBAR_MIN_WIDTH = 320;
export const SIDEBAR_MAX_WIDTH = 700;
export const SIDEBAR_DEFAULT_WIDTH = 320;

export type WidgetId = "country" | "road" | "details" | "coordinates";

export type FontSize = "sm" | "md" | "lg";

export type TextStyle = {
  color: string | null;
  bold: boolean;
  fontSize: FontSize;
};

export type DisplayConfig = {
  order: WidgetId[];
  textStyles: Record<string, TextStyle>;
  hiddenTexts: Record<string, true>;
  mapVisible: boolean;
  sidebarWidth: number;
};

const ALL_WIDGETS: WidgetId[] = ["country", "road", "details", "coordinates"];

export const WIDGET_LABELS: Record<WidgetId, string> = {
  country: "Country & flag",
  road: "Road & postcode",
  details: "Country details",
  coordinates: "Coordinates",
};

export const DEFAULT_TEXT_STYLE: TextStyle = {
  color: null,
  bold: false,
  fontSize: "md",
};

const DEFAULT_CONFIG: DisplayConfig = {
  order: [...ALL_WIDGETS],
  textStyles: {},
  hiddenTexts: {},
  mapVisible: true,
  sidebarWidth: SIDEBAR_DEFAULT_WIDTH,
};

const STORAGE_KEY = "geohelper.display";
const KNOWN_WIDGETS = new Set<WidgetId>(ALL_WIDGETS);
const FONT_SIZES = new Set<FontSize>(["sm", "md", "lg"]);

function cloneDefault(): DisplayConfig {
  return {
    order: [...DEFAULT_CONFIG.order],
    textStyles: {},
    hiddenTexts: {},
    mapVisible: DEFAULT_CONFIG.mapVisible,
    sidebarWidth: DEFAULT_CONFIG.sidebarWidth,
  };
}

function safeJsonParse(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function isWidgetId(value: unknown): value is WidgetId {
  return typeof value === "string" && KNOWN_WIDGETS.has(value as WidgetId);
}

function normalizeTextStyle(raw: unknown): TextStyle | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Partial<TextStyle>;
  return {
    color: typeof s.color === "string" ? s.color : null,
    bold: s.bold === true,
    fontSize: FONT_SIZES.has(s.fontSize as FontSize) ? (s.fontSize as FontSize) : "md",
  };
}

function normalizeDisplayConfig(raw: unknown): DisplayConfig {
  if (!raw || typeof raw !== "object") return cloneDefault();
  const parsed = raw as Partial<DisplayConfig>;

  const order = Array.isArray(parsed.order) ? parsed.order.filter(isWidgetId) : [];
  const ordered = new Set(order);
  for (const widget of ALL_WIDGETS) {
    if (!ordered.has(widget)) order.push(widget);
  }

  const textStyles: Record<string, TextStyle> = {};
  if (parsed.textStyles && typeof parsed.textStyles === "object") {
    for (const [key, value] of Object.entries(parsed.textStyles as Record<string, unknown>)) {
      const normalized = normalizeTextStyle(value);
      if (normalized) textStyles[key] = normalized;
    }
  }

  const hiddenTexts: Record<string, true> = {};
  if (parsed.hiddenTexts && typeof parsed.hiddenTexts === "object") {
    for (const [key, value] of Object.entries(parsed.hiddenTexts as Record<string, unknown>)) {
      if (value === true) hiddenTexts[key] = true;
    }
  }

  const sidebarWidth =
    typeof parsed.sidebarWidth === "number" && Number.isFinite(parsed.sidebarWidth)
      ? clampSidebar(parsed.sidebarWidth)
      : SIDEBAR_DEFAULT_WIDTH;

  return {
    order,
    textStyles,
    hiddenTexts,
    mapVisible: typeof parsed.mapVisible === "boolean" ? parsed.mapVisible : true,
    sidebarWidth,
  };
}

function clampSidebar(value: number): number {
  return Math.max(SIDEBAR_MIN_WIDTH, Math.min(SIDEBAR_MAX_WIDTH, Math.round(value)));
}

function load(): DisplayConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? normalizeDisplayConfig(safeJsonParse(raw)) : cloneDefault();
  } catch {
    return cloneDefault();
  }
}

function save(state: DisplayConfig): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        order: state.order,
        textStyles: state.textStyles,
        hiddenTexts: state.hiddenTexts,
        mapVisible: state.mapVisible,
        sidebarWidth: state.sidebarWidth,
      }),
    );
  } catch {
    return;
  }
}

type DisplayStore = DisplayConfig & {
  editing: boolean;
  selection: string[];
  registeredIds: Record<string, true>;

  toggleEditing: () => void;
  stopEditing: () => void;
  setOrder: (order: WidgetId[]) => void;
  setMapVisible: (visible: boolean) => void;
  setSidebarWidth: (width: number) => void;
  registerText: (id: string) => void;
  unregisterText: (id: string) => void;

  setSelection: (ids: string[]) => void;
  addToSelection: (ids: string[]) => void;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;
  selectWidget: (widget: WidgetId, additive?: boolean) => void;

  setSelectionStyle: (patch: Partial<TextStyle>) => void;
  setSelectionHidden: (hidden: boolean) => void;
  resetSelection: () => void;
  resetWidget: (id: WidgetId) => void;
  resetAll: () => void;
};

export const useDisplayStore = create<DisplayStore>((set, get) => ({
  ...load(),
  editing: false,
  selection: [],
  registeredIds: {},

  registerText: (id) => {
    if (get().registeredIds[id]) return;
    set({ registeredIds: { ...get().registeredIds, [id]: true } });
  },
  unregisterText: (id) => {
    if (!get().registeredIds[id]) return;
    const next = { ...get().registeredIds };
    delete next[id];
    set({ registeredIds: next });
  },

  toggleEditing: () => {
    const editing = !get().editing;
    set({ editing, selection: [] });
  },
  stopEditing: () => set({ editing: false, selection: [] }),

  setOrder: (order) => {
    const next = { ...get(), order };
    set({ order });
    save(next);
  },
  setMapVisible: (mapVisible) => {
    set({ mapVisible });
    save({ ...get(), mapVisible });
  },
  setSidebarWidth: (width) => {
    const sidebarWidth = clampSidebar(width);
    if (sidebarWidth === get().sidebarWidth) return;
    set({ sidebarWidth });
    save({ ...get(), sidebarWidth });
  },

  setSelection: (ids) => set({ selection: dedupe(ids) }),
  addToSelection: (ids) => set({ selection: dedupe([...get().selection, ...ids]) }),
  toggleSelection: (id) => {
    const current = get().selection;
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    set({ selection: next });
  },
  clearSelection: () => set({ selection: [] }),
  selectWidget: (widget, additive = false) => {
    const prefix = `${widget}.`;
    const ids: string[] = [];
    document.querySelectorAll<HTMLElement>("[data-text-id]").forEach((node) => {
      const id = node.dataset.textId;
      if (id && id.startsWith(prefix)) ids.push(id);
    });
    if (additive) set({ selection: dedupe([...get().selection, ...ids]) });
    else set({ selection: dedupe(ids) });
  },

  setSelectionStyle: (patch) => {
    const { selection, textStyles } = get();
    if (selection.length === 0) return;
    const nextStyles = { ...textStyles };
    for (const id of selection) {
      const current = nextStyles[id] ?? { ...DEFAULT_TEXT_STYLE };
      nextStyles[id] = { ...current, ...patch };
    }
    set({ textStyles: nextStyles });
    save({ ...get(), textStyles: nextStyles });
  },
  setSelectionHidden: (hidden) => {
    const { selection, hiddenTexts } = get();
    if (selection.length === 0) return;
    const next = { ...hiddenTexts };
    for (const id of selection) {
      if (hidden) next[id] = true;
      else delete next[id];
    }
    set({ hiddenTexts: next });
    save({ ...get(), hiddenTexts: next });
  },
  resetSelection: () => {
    const { selection, textStyles } = get();
    if (selection.length === 0) return;
    const nextStyles = { ...textStyles };
    for (const id of selection) delete nextStyles[id];
    set({ textStyles: nextStyles });
    save({ ...get(), textStyles: nextStyles });
  },
  resetWidget: (id) => {
    const prefix = `${id}.`;
    const nextStyles: Record<string, TextStyle> = {};
    for (const [key, style] of Object.entries(get().textStyles)) {
      if (!key.startsWith(prefix)) nextStyles[key] = style;
    }
    const nextHidden: Record<string, true> = {};
    for (const key of Object.keys(get().hiddenTexts)) {
      if (!key.startsWith(prefix)) nextHidden[key] = true;
    }
    set({
      textStyles: nextStyles,
      hiddenTexts: nextHidden,
      selection: get().selection.filter((s) => !s.startsWith(prefix)),
    });
    save({ ...get(), textStyles: nextStyles, hiddenTexts: nextHidden });
  },
  resetAll: () => {
    const fresh = cloneDefault();
    set({ ...fresh, selection: [] });
    save(fresh);
  },
}));

function dedupe(ids: string[]): string[] {
  return Array.from(new Set(ids));
}

export const FONT_SIZE_PX: Record<FontSize, string> = {
  sm: "11px",
  md: "13px",
  lg: "15px",
};

export const FLAG_SIZE: Record<FontSize, { width: string; height: string }> = {
  sm: { width: "1.6em", height: "1.2em" },
  md: { width: "2.2em", height: "1.6em" },
  lg: { width: "2.8em", height: "2em" },
};

export function textStyleToCss(style: TextStyle | undefined, mono = false): React.CSSProperties {
  if (!style) {
    return {
      fontFamily: mono
        ? "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
        : undefined,
    };
  }
  return {
    color: style.color ?? undefined,
    fontWeight: style.bold ? 600 : undefined,
    fontSize: FONT_SIZE_PX[style.fontSize],
    fontFamily: mono
      ? "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
      : undefined,
  };
}
