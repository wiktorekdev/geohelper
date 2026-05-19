import type { Theme } from "./types";

/**
 * Built-in themes shipped with the app. Adding a new entry here makes it
 * appear automatically after an update — user themes loaded from
 * `themes.json` are independent and rendered after these.
 */
export const BUILTIN_THEMES: Theme[] = [
  {
    id: "dark",
    name: "Dark",
    mode: "dark",
    icon: "Moon",
    description: "Default dark theme.",
    builtin: true,
  },
  {
    id: "light",
    name: "Light",
    mode: "light",
    icon: "Sun",
    description: "Default light theme.",
    builtin: true,
  },
  {
    id: "sunset",
    name: "Sunset",
    mode: "dark",
    icon: "Sunset",
    description: "Warm orange and red dusk.",
    vars: {
      background: "oklch(0.18 0.05 40)",
      foreground: "oklch(0.97 0.02 60)",
      sidebar: "oklch(0.22 0.06 40)",
      "sidebar-border": "oklch(0.7 0.18 50 / 24%)",
      card: "oklch(0.24 0.07 40)",
      popover: "oklch(0.24 0.07 40)",
      "popover-foreground": "oklch(0.97 0.02 60)",
      primary: "oklch(0.78 0.2 50)",
      "primary-foreground": "oklch(0.18 0.05 40)",
      secondary: "oklch(0.3 0.08 40)",
      muted: "oklch(0.3 0.06 40)",
      "muted-foreground": "oklch(0.78 0.06 50)",
      accent: "oklch(0.32 0.1 40)",
      "accent-foreground": "oklch(0.97 0.02 60)",
      border: "oklch(0.7 0.18 50 / 24%)",
      input: "oklch(0.7 0.18 50 / 30%)",
      ring: "oklch(0.78 0.18 50)",
      brand: "oklch(0.72 0.22 35)",
    },
    background: {
      image:
        "linear-gradient(180deg, rgba(251,146,60,0.16) 0%, transparent 60%), radial-gradient(circle at 50% 100%, rgba(244,63,94,0.22), transparent 55%)",
      opacity: 1,
    },
    builtin: true,
  },
  {
    id: "forest",
    name: "Forest",
    mode: "dark",
    icon: "Trees",
    description: "Calm pine green.",
    vars: {
      background: "oklch(0.15 0.03 160)",
      foreground: "oklch(0.96 0.02 150)",
      sidebar: "oklch(0.18 0.04 160)",
      "sidebar-border": "oklch(0.7 0.12 160 / 22%)",
      card: "oklch(0.2 0.05 160)",
      popover: "oklch(0.2 0.05 160)",
      "popover-foreground": "oklch(0.96 0.02 150)",
      primary: "oklch(0.78 0.16 155)",
      "primary-foreground": "oklch(0.15 0.03 160)",
      secondary: "oklch(0.25 0.06 160)",
      muted: "oklch(0.25 0.04 160)",
      "muted-foreground": "oklch(0.74 0.04 160)",
      accent: "oklch(0.3 0.08 160)",
      "accent-foreground": "oklch(0.96 0.02 150)",
      border: "oklch(0.7 0.12 160 / 22%)",
      input: "oklch(0.7 0.12 160 / 28%)",
      ring: "oklch(0.7 0.14 160)",
      brand: "oklch(0.72 0.18 155)",
    },
    builtin: true,
  },
];
