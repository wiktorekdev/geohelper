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
    builtin: true,
  },
  {
    id: "light",
    name: "Light",
    mode: "light",
    icon: "Sun",
    builtin: true,
  },
];
