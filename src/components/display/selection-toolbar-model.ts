import type { TextFont, TextStyle } from "@/lib/display-store"

export type SelectionStyleSummary = {
  color: string | null
  bold: boolean
  italic: boolean
  underline: boolean
  rainbow: boolean
  fontSize: number | undefined
  fontFamily: TextFont | undefined
}

export function selectionKind(id: string): "flag" | "text" {
  return id === "country.flag" ? "flag" : "text"
}

export function summarizeSelectionStyles(styles: TextStyle[]): SelectionStyleSummary {
  if (styles.length === 0) {
    return {
      color: null,
      bold: false,
      italic: false,
      underline: false,
      rainbow: false,
      fontSize: undefined,
      fontFamily: undefined,
    }
  }

  const first = styles[0]
  const shared = <K extends keyof TextStyle>(key: K) =>
    styles.every((style) => style[key] === first[key]) ? first[key] : undefined

  return {
    color: shared("color") ?? null,
    bold: shared("bold") ?? false,
    italic: shared("italic") ?? false,
    underline: shared("underline") ?? false,
    rainbow: shared("rainbow") ?? false,
    fontSize: shared("fontSize"),
    fontFamily: shared("fontFamily"),
  }
}

export function parseColorInput(raw: string): string | null {
  const value = raw.trim()
  const hex = value.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i)
  if (hex) {
    const digits = hex[1]
    return digits.length === 3
      ? `#${digits[0]}${digits[0]}${digits[1]}${digits[1]}${digits[2]}${digits[2]}`
      : `#${digits}`
  }

  const rgb = value.match(/^(?:rgb\s*\(\s*)?(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)?$/)
  if (!rgb) return null
  const channels = [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])]
  if (channels.some((channel) => channel > 255)) return null
  return `#${channels.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`
}
