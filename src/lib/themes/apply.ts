import type { Theme } from "./types"

const STYLE_ID = "geohelper-theme-vars"
const BG_LAYER_ID = "geohelper-theme-bg"

export function applyTheme(theme: Theme): void {
  const root = document.documentElement

  if (theme.mode === "dark") root.classList.add("dark")
  else root.classList.remove("dark")

  document.getElementById(STYLE_ID)?.remove()
  document.getElementById(BG_LAYER_ID)?.remove()
}
