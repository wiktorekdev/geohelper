import type { CSSProperties } from "react"

import { normalizeHexColor } from "./utils"

export type FontSize = "sm" | "md" | "lg"

export type TextStyle = {
  color: string | null
  bold: boolean
  fontSize: FontSize
}

export const DEFAULT_TEXT_STYLE: TextStyle = {
  color: null,
  bold: false,
  fontSize: "md",
}

export const FONT_SIZES = new Set<FontSize>(["sm", "md", "lg"])

export function normalizeTextStyle(raw: unknown): TextStyle | null {
  if (!raw || typeof raw !== "object") return null
  const style = raw as Partial<TextStyle>
  return {
    color: typeof style.color === "string" ? normalizeHexColor(style.color, "") || null : null,
    bold: style.bold === true,
    fontSize: FONT_SIZES.has(style.fontSize as FontSize) ? (style.fontSize as FontSize) : "md",
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
    const current = nextStyles[id] ?? { ...DEFAULT_TEXT_STYLE }
    nextStyles[id] = { ...current, ...normalizedPatch }
  }
  return nextStyles
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

export const FONT_SIZE_PX: Record<FontSize, string> = {
  sm: "11px",
  md: "13px",
  lg: "15px",
}

export const FLAG_SIZE: Record<FontSize, { width: string; height: string }> = {
  sm: { width: "1.6em", height: "1.2em" },
  md: { width: "2.2em", height: "1.6em" },
  lg: { width: "2.8em", height: "2em" },
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
    color: style.color ?? undefined,
    fontWeight: style.bold ? 600 : undefined,
    fontSize: FONT_SIZE_PX[style.fontSize],
    fontFamily: mono
      ? "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
      : undefined,
  }
}
