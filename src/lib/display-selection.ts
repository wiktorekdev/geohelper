import type { CSSProperties } from "react"

import { normalizeHexColor } from "./utils"

export type TextFont = string

export type TextStyle = {
  color: string | null
  bold: boolean
  italic: boolean
  underline: boolean
  rainbow: boolean
  fontSize: number
  fontFamily: TextFont
}

export const DEFAULT_TEXT_STYLE: TextStyle = {
  color: null,
  bold: false,
  italic: false,
  underline: false,
  rainbow: false,
  fontSize: 13,
  fontFamily: "default",
}

export const MIN_TEXT_SIZE = 8
export const MAX_TEXT_SIZE = 40

export const TEXT_FONT_OPTIONS = [
  { id: "default", label: "Default", family: undefined },
  { id: "Poppins", label: "Poppins", family: "'Poppins', ui-sans-serif, system-ui, sans-serif" },
  { id: "Montserrat", label: "Montserrat", family: "'Montserrat', ui-sans-serif, system-ui, sans-serif" },
  { id: "Nunito", label: "Nunito", family: "'Nunito', ui-sans-serif, system-ui, sans-serif" },
  { id: "Lato", label: "Lato", family: "'Lato', ui-sans-serif, system-ui, sans-serif" },
  { id: "Oswald", label: "Oswald", family: "'Oswald', ui-sans-serif, system-ui, sans-serif" },
  { id: "Playfair Display", label: "Playfair", family: "'Playfair Display', Georgia, serif" },
  { id: "JetBrains Mono", label: "JetBrains", family: "'JetBrains Mono', ui-monospace, monospace" },
  { id: "Roboto", label: "Roboto", family: "'Roboto', ui-sans-serif, system-ui, sans-serif" },
  { id: "Inter", label: "Inter", family: "'Inter', ui-sans-serif, system-ui, sans-serif" },
  { id: "Raleway", label: "Raleway", family: "'Raleway', ui-sans-serif, system-ui, sans-serif" },
  { id: "Merriweather", label: "Merriweather", family: "'Merriweather', Georgia, serif" },
  { id: "Bebas Neue", label: "Bebas Neue", family: "'Bebas Neue', ui-sans-serif, system-ui, sans-serif" },
  { id: "Pacifico", label: "Pacifico", family: "'Pacifico', cursive" },
  { id: "Rubik", label: "Rubik", family: "'Rubik', ui-sans-serif, system-ui, sans-serif" },
  { id: "Caveat", label: "Caveat", family: "'Caveat', cursive" },
  { id: "Dancing Script", label: "Dancing Script", family: "'Dancing Script', cursive" },
  { id: "Archivo", label: "Archivo", family: "'Archivo', ui-sans-serif, system-ui, sans-serif" },
  { id: "Manrope", label: "Manrope", family: "'Manrope', ui-sans-serif, system-ui, sans-serif" },
  { id: "Quicksand", label: "Quicksand", family: "'Quicksand', ui-sans-serif, system-ui, sans-serif" },
  { id: "Work Sans", label: "Work Sans", family: "'Work Sans', ui-sans-serif, system-ui, sans-serif" },
] as const

const TEXT_FONTS = new Set<string>(TEXT_FONT_OPTIONS.map((font) => font.id))
const LEGACY_FONT_IDS: Record<string, string> = {
  poppins: "Poppins",
  montserrat: "Montserrat",
  nunito: "Nunito",
  lato: "Lato",
  oswald: "Oswald",
  playfair: "Playfair Display",
  jetbrains: "JetBrains Mono",
}
const LEGACY_FONT_SIZE_PX: Record<string, number> = {
  sm: 11,
  md: 13,
  lg: 15,
}

export function normalizeTextSize(value: unknown): number {
  if (typeof value === "string" && value in LEGACY_FONT_SIZE_PX) {
    return LEGACY_FONT_SIZE_PX[value]
  }
  const parsed = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(parsed)) return DEFAULT_TEXT_STYLE.fontSize
  return Math.max(MIN_TEXT_SIZE, Math.min(MAX_TEXT_SIZE, Math.round(parsed)))
}

export function normalizeTextFont(value: unknown): TextFont {
  if (typeof value !== "string") return DEFAULT_TEXT_STYLE.fontFamily
  const trimmed = value.trim().replace(/\s+/g, " ")
  if (!trimmed || trimmed === DEFAULT_TEXT_STYLE.fontFamily) return DEFAULT_TEXT_STYLE.fontFamily
  const normalized = LEGACY_FONT_IDS[trimmed] ?? trimmed
  return TEXT_FONTS.has(normalized) ? normalized : DEFAULT_TEXT_STYLE.fontFamily
}

export function normalizeTextStyle(raw: unknown): TextStyle | null {
  if (!raw || typeof raw !== "object") return null
  const style = raw as Partial<TextStyle>
  return {
    color: typeof style.color === "string" ? normalizeHexColor(style.color, "") || null : null,
    bold: style.bold === true,
    italic: style.italic === true,
    underline: style.underline === true,
    rainbow: style.rainbow === true,
    fontSize: normalizeTextSize(style.fontSize),
    fontFamily: normalizeTextFont(style.fontFamily),
  }
}

export function dedupeTextIds(ids: string[]): string[] {
  return Array.from(new Set(ids))
}

export function selectRegisteredWidgetTexts(
  registeredIds: Record<string, true>,
  widget: string,
  currentSelection: string[],
  additive: boolean
): string[] {
  const prefix = `${widget}.`
  const ids = Object.keys(registeredIds).filter((id) => id.startsWith(prefix))
  return additive ? dedupeTextIds([...currentSelection, ...ids]) : dedupeTextIds(ids)
}

export function applySelectionStyle(
  textStyles: Record<string, TextStyle>,
  selection: string[],
  patch: Partial<TextStyle>
): Record<string, TextStyle> {
  const normalizedPatch =
    typeof patch.color === "string"
      ? { ...patch, color: normalizeHexColor(patch.color, "") || null }
      : patch
  const nextStyles = { ...textStyles }
  for (const id of selection) {
    const applicablePatch = id === "country.flag" ? pickFlagStylePatch(normalizedPatch) : normalizedPatch
    if (Object.keys(applicablePatch).length === 0) continue
    const current = nextStyles[id] ?? { ...DEFAULT_TEXT_STYLE }
    nextStyles[id] = normalizeTextStyle({ ...current, ...applicablePatch }) ?? { ...DEFAULT_TEXT_STYLE }
  }
  return nextStyles
}

function pickFlagStylePatch(patch: Partial<TextStyle>): Partial<TextStyle> {
  return patch.fontSize !== undefined
    ? { fontSize: normalizeTextSize(patch.fontSize) }
    : {}
}

export function setSelectionHiddenState(
  hiddenTexts: Record<string, true>,
  selection: string[],
  hidden: boolean
): Record<string, true> {
  const next = { ...hiddenTexts }
  for (const id of selection) {
    if (hidden) next[id] = true
    else delete next[id]
  }
  return next
}

export function resetSelectedStyles(
  textStyles: Record<string, TextStyle>,
  selection: string[]
): Record<string, TextStyle> {
  const nextStyles = { ...textStyles }
  for (const id of selection) delete nextStyles[id]
  return nextStyles
}

export function resetWidgetTextState(
  widget: string,
  textStyles: Record<string, TextStyle>,
  hiddenTexts: Record<string, true>,
  selection: string[]
): {
  textStyles: Record<string, TextStyle>
  hiddenTexts: Record<string, true>
  selection: string[]
} {
  const prefix = `${widget}.`
  const nextStyles: Record<string, TextStyle> = {}
  for (const [key, style] of Object.entries(textStyles)) {
    if (!key.startsWith(prefix)) nextStyles[key] = style
  }
  const nextHidden: Record<string, true> = {}
  for (const [key, value] of Object.entries(hiddenTexts)) {
    if (!key.startsWith(prefix)) nextHidden[key] = value
  }
  return {
    textStyles: nextStyles,
    hiddenTexts: nextHidden,
    selection: selection.filter((id) => !id.startsWith(prefix)),
  }
}

export function getTextFontFamily(font: TextFont, mono = false): string | undefined {
  if (mono) return "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
  const normalized = normalizeTextFont(font)
  if (normalized === DEFAULT_TEXT_STYLE.fontFamily) return undefined
  return TEXT_FONT_OPTIONS.find((option) => option.id === normalized)?.family
}

export function textStyleToCss(style: TextStyle | undefined, mono = false): CSSProperties {
  if (!style) {
    return {
      fontFamily: mono
        ? "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
        : undefined,
    }
  }
  return {
    color: style.rainbow ? "transparent" : (style.color ?? undefined),
    backgroundImage: style.rainbow
      ? "linear-gradient(90deg, #ff3355, #ff9f1c, #f7ff00, #2ee66b, #18c8ff, #7c5cff, #ff4fd8, #ff3355)"
      : undefined,
    backgroundClip: style.rainbow ? "text" : undefined,
    WebkitBackgroundClip: style.rainbow ? "text" : undefined,
    fontWeight: style.bold ? 600 : undefined,
    fontStyle: style.italic ? "italic" : undefined,
    textDecorationLine: style.underline ? "underline" : undefined,
    fontSize: `${normalizeTextSize(style.fontSize)}px`,
    fontFamily: getTextFontFamily(style.fontFamily, mono),
  }
}
