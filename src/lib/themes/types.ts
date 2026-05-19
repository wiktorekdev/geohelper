/**
 * Theme schema. Themes override CSS variables on `html`. The user can also
 * supply a font family and a decorative background. Built-in themes ship with
 * the app and are merged with any user-defined themes from disk.
 */
export type ThemeMode = "dark" | "light";

export type ThemeBackground = {
  /** Any valid CSS image value: url(...), linear-gradient(...), etc. */
  image?: string;
  /** Multiplied with the base background, 0..1. Higher = more visible. */
  opacity?: number;
  /** CSS blend-mode for compositing the image over the base. */
  blend?: string;
  /** Optional blur in pixels applied to the layer. */
  blur?: number;
};

/** CSS variable overrides. Keys map to `--<key>` on the root element. */
export type ThemeVars = Partial<Record<string, string>>;

export type Theme = {
  id: string;
  name: string;
  /** Determines the base palette and dark-mode class. User overrides on top. */
  mode: ThemeMode;
  /** Optional emoji or short label used as the swatch icon. */
  emoji?: string;
  /**
   * Optional lucide icon name (e.g. "Moon", "Sun", "Sunset", "Trees").
   * Renders inside the swatch when provided. Takes precedence over `emoji`.
   */
  icon?: string;
  /**
   * Optional custom icon: a URL to an image (png/svg) or an inline `data:` URI.
   * Takes precedence over both `icon` and `emoji`.
   */
  iconUrl?: string;
  /** CSS variable overrides applied after the base palette. */
  vars?: ThemeVars;
  /** Optional font family. Applied to `body { font-family }`. */
  font?: string;
  /** Optional background layer rendered above the base background. */
  background?: ThemeBackground;
  /** Built-in themes ship with the app and cannot be deleted, only hidden. */
  builtin?: boolean;
};

/** Variables a theme is allowed to tweak. Other CSS vars stay at their defaults. */
export const EDITABLE_VARS = [
  "background",
  "foreground",
  "sidebar",
  "sidebar-border",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "border",
  "input",
  "ring",
  "brand",
] as const;

export type EditableVar = (typeof EDITABLE_VARS)[number];
