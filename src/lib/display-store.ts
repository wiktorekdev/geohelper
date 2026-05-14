import { create } from "zustand";

/** Inner width of the main sidebar (must match `w-[320px]` in layout components). */
export const SIDEBAR_WIDTH_PX = 320;

export type WidgetId = "country" | "road" | "details" | "coordinates";

export type FontSize = "sm" | "md" | "lg";

export type WidgetStyle = {
  color: string | null;
  bold: boolean;
  fontSize: FontSize;
};

export type DisplayConfig = {
  order: WidgetId[];
  visibility: Record<WidgetId, boolean>;
  styles: Record<WidgetId, WidgetStyle>;
  mapVisible: boolean;
};

const ALL_WIDGETS: WidgetId[] = ["country", "road", "details", "coordinates"];

export const WIDGET_LABELS: Record<WidgetId, string> = {
  country: "Country & flag",
  road: "Road & postcode",
  details: "Country details",
  coordinates: "Coordinates",
};

const DEFAULT_STYLE: WidgetStyle = { color: null, bold: false, fontSize: "md" };

const DEFAULT_CONFIG: DisplayConfig = {
  order: [...ALL_WIDGETS],
  visibility: Object.fromEntries(ALL_WIDGETS.map((w) => [w, true])) as Record<WidgetId, boolean>,
  styles: Object.fromEntries(ALL_WIDGETS.map((w) => [w, { ...DEFAULT_STYLE }])) as Record<
    WidgetId,
    WidgetStyle
  >,
  mapVisible: true,
};

const STORAGE_KEY = "geohelper.display";
const KNOWN_WIDGETS = new Set<WidgetId>(ALL_WIDGETS);
const FONT_SIZES = new Set<FontSize>(["sm", "md", "lg"]);

function cloneDefault(): DisplayConfig {
  return {
    order: [...DEFAULT_CONFIG.order],
    visibility: { ...DEFAULT_CONFIG.visibility },
    styles: Object.fromEntries(
      ALL_WIDGETS.map((w) => [w, { ...DEFAULT_CONFIG.styles[w] }]),
    ) as Record<WidgetId, WidgetStyle>,
    mapVisible: DEFAULT_CONFIG.mapVisible,
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

function normalizeDisplayConfig(raw: unknown): DisplayConfig {
  if (!raw || typeof raw !== "object") return cloneDefault();
  const parsed = raw as Partial<DisplayConfig>;

  const order = Array.isArray(parsed.order) ? parsed.order.filter(isWidgetId) : [];
  const ordered = new Set(order);
  for (const widget of ALL_WIDGETS) {
    if (!ordered.has(widget)) order.push(widget);
  }

  const visibility: Record<WidgetId, boolean> = { ...DEFAULT_CONFIG.visibility };
  if (parsed.visibility && typeof parsed.visibility === "object") {
    for (const widget of ALL_WIDGETS) {
      const value = (parsed.visibility as Record<string, unknown>)[widget];
      if (typeof value === "boolean") visibility[widget] = value;
    }
  }

  const styles = cloneDefault().styles;
  if (parsed.styles && typeof parsed.styles === "object") {
    for (const widget of ALL_WIDGETS) {
      const style = (parsed.styles as Record<string, unknown>)[widget] as
        | Partial<WidgetStyle>
        | undefined;
      if (!style || typeof style !== "object") continue;
      styles[widget] = {
        color: typeof style.color === "string" ? style.color : null,
        bold: style.bold === true,
        fontSize: FONT_SIZES.has(style.fontSize as FontSize) ? (style.fontSize as FontSize) : "md",
      };
    }
  }

  return {
    order,
    visibility,
    styles,
    mapVisible: typeof parsed.mapVisible === "boolean" ? parsed.mapVisible : true,
  };
}

function load(): DisplayConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? normalizeDisplayConfig(safeJsonParse(raw)) : cloneDefault();
  } catch {
    return cloneDefault();
  }
}

function selectConfig(state: DisplayConfig): DisplayConfig {
  return {
    order: [...state.order],
    visibility: { ...state.visibility },
    styles: Object.fromEntries(
      ALL_WIDGETS.map((w) => [w, { ...state.styles[w] }]),
    ) as Record<WidgetId, WidgetStyle>,
    mapVisible: state.mapVisible,
  };
}

function save(state: DisplayConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectConfig(state)));
  } catch {
    return;
  }
}

type DisplayStore = DisplayConfig & {
  editing: boolean;

  toggleEditing: () => void;
  stopEditing: () => void;
  setOrder: (order: WidgetId[]) => void;
  setVisibility: (id: WidgetId, visible: boolean) => void;
  setStyle: (id: WidgetId, patch: Partial<WidgetStyle>) => void;
  setMapVisible: (visible: boolean) => void;
  resetWidget: (id: WidgetId) => void;
  resetAll: () => void;
};

export const useDisplayStore = create<DisplayStore>((set, get) => ({
  ...load(),
  editing: false,

  toggleEditing: () => set({ editing: !get().editing }),
  stopEditing: () => set({ editing: false }),

  setOrder: (order) => {
    const next = { ...get(), order };
    set(next);
    save(next);
  },
  setVisibility: (id, visible) => {
    const next = { ...get(), visibility: { ...get().visibility, [id]: visible } };
    set(next);
    save(next);
  },
  setStyle: (id, patch) => {
    const next = {
      ...get(),
      styles: { ...get().styles, [id]: { ...get().styles[id], ...patch } },
    };
    set(next);
    save(next);
  },
  setMapVisible: (visible) => {
    const next = { ...get(), mapVisible: visible };
    set(next);
    save(next);
  },
  resetWidget: (id) => {
    const next = { ...get(), styles: { ...get().styles, [id]: { ...DEFAULT_STYLE } } };
    set(next);
    save(next);
  },
  resetAll: () => {
    const fresh = cloneDefault();
    set(fresh);
    save(fresh);
  },
}));

export const FONT_SIZE_PX: Record<FontSize, string> = {
  sm: "11px",
  md: "13px",
  lg: "15px",
};
