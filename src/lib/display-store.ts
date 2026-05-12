import { create } from "zustand";

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

function load(): DisplayConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneDefault();
    const parsed = JSON.parse(raw) as Partial<DisplayConfig> | null;
    if (!parsed) return cloneDefault();

    const orderRaw = Array.isArray(parsed.order) ? parsed.order : [];
    const order = orderRaw.filter((w): w is WidgetId => KNOWN_WIDGETS.has(w as WidgetId));
    const ordered = new Set(order);
    for (const w of ALL_WIDGETS) {
      if (!ordered.has(w)) order.push(w);
    }

    const visibility: Record<WidgetId, boolean> = { ...DEFAULT_CONFIG.visibility };
    if (parsed.visibility && typeof parsed.visibility === "object") {
      for (const w of ALL_WIDGETS) {
        const v = (parsed.visibility as Record<string, unknown>)[w];
        if (typeof v === "boolean") visibility[w] = v;
      }
    }

    const styles = cloneDefault().styles;
    if (parsed.styles && typeof parsed.styles === "object") {
      for (const w of ALL_WIDGETS) {
        const s = (parsed.styles as Record<string, unknown>)[w] as Partial<WidgetStyle> | undefined;
        if (s && typeof s === "object") {
          styles[w] = {
            color: typeof s.color === "string" ? s.color : null,
            bold: s.bold === true,
            fontSize:
              s.fontSize === "sm" || s.fontSize === "md" || s.fontSize === "lg" ? s.fontSize : "md",
          };
        }
      }
    }

    return {
      order,
      visibility,
      styles,
      mapVisible: typeof parsed.mapVisible === "boolean" ? parsed.mapVisible : true,
    };
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
    set({ order });
    save(get());
  },
  setVisibility: (id, visible) => {
    const visibility = { ...get().visibility, [id]: visible };
    set({ visibility });
    save(get());
  },
  setStyle: (id, patch) => {
    const styles = { ...get().styles, [id]: { ...get().styles[id], ...patch } };
    set({ styles });
    save(get());
  },
  setMapVisible: (visible) => {
    set({ mapVisible: visible });
    save(get());
  },
  resetWidget: (id) => {
    const styles = { ...get().styles, [id]: { ...DEFAULT_STYLE } };
    set({ styles });
    save(get());
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
