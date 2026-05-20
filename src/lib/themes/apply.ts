import type { Theme } from "./types"

const STYLE_ID = "geohelper-theme-vars"
const BG_LAYER_ID = "geohelper-theme-bg"

/** Apply a theme to the document root. Removes any previous theme styles first. */
export function applyTheme(theme: Theme): void {
  const root = document.documentElement

  // Mode toggles the .dark class which existing CSS variables already key off.
  if (theme.mode === "dark") root.classList.add("dark")
  else root.classList.remove("dark")

  // CSS variable overrides go into a single managed <style> tag so we never
  // touch element.style and can wipe everything on theme switch.
  const style = ensure<HTMLStyleElement>(STYLE_ID, "style")
  const declarations: string[] = []
  for (const [key, value] of Object.entries(theme.vars ?? {})) {
    if (typeof value === "string" && value.length > 0) {
      declarations.push(`--${key}: ${value};`)
    }
  }
  if (theme.font) declarations.push(`font-family: ${theme.font};`)

  style.textContent = declarations.length ? `:root, html.dark { ${declarations.join(" ")} }` : ""

  // Decorative background image layer rendered behind the rest of the UI.
  const bg = ensure<HTMLDivElement>(BG_LAYER_ID, "div")
  if (theme.background?.image) {
    Object.assign(bg.style, {
      position: "fixed",
      inset: "0",
      pointerEvents: "none",
      zIndex: "0",
      backgroundImage: theme.background.image,
      backgroundSize: "cover",
      backgroundPosition: "center",
      opacity: String(theme.background.opacity ?? 1),
      mixBlendMode: theme.background.blend ?? "normal",
      filter: theme.background.blur ? `blur(${theme.background.blur}px)` : "none",
    } satisfies Partial<CSSStyleDeclaration>)
    bg.dataset.active = "true"
  } else {
    bg.removeAttribute("style")
    delete bg.dataset.active
  }
}

function ensure<T extends HTMLElement>(id: string, tag: string): T {
  const existing = document.getElementById(id)
  if (existing) return existing as T
  const el = document.createElement(tag)
  el.id = id
  if (tag === "div") document.body.prepend(el)
  else document.head.appendChild(el)
  return el as T
}
