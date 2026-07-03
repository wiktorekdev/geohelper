import { m, AnimatePresence } from "motion/react"
import { Bold, Eye, EyeOff, Italic, RotateCcw, Type, Underline, X } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import * as Toolbar from "@radix-ui/react-toolbar"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ColorPicker, ColorPickerSelection, ColorPickerHue } from "@/components/ui/color-picker"
import {
  DEFAULT_TEXT_STYLE,
  MAX_TEXT_SIZE,
  MIN_TEXT_SIZE,
  TEXT_FONT_OPTIONS,
  normalizeTextSize,
  useDisplayStore,
  type TextFont,
  type TextStyle,
} from "@/lib/display-store"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useT } from "@/lib/i18n"

export function SelectionToolbar() {
  const t = useT()
  const editing = useDisplayStore((s) => s.editing)
  const selection = useDisplayStore((s) => s.selection)
  const textStyles = useDisplayStore((s) => s.textStyles)
  const hiddenTexts = useDisplayStore((s) => s.hiddenTexts)
  const mapVisible = useDisplayStore((s) => s.mapVisible)
  const setSelectionStyle = useDisplayStore((s) => s.setSelectionStyle)
  const setSelectionHidden = useDisplayStore((s) => s.setSelectionHidden)
  const resetSelection = useDisplayStore((s) => s.resetSelection)
  const clearSelection = useDisplayStore((s) => s.clearSelection)

  const visible = editing && selection.length > 0

  const summary = summarize(selection.map((id) => textStyles[id] ?? DEFAULT_TEXT_STYLE))

  const allHidden = selection.every((id) => hiddenTexts[id] === true)

  // Capability flags vary by element kind. Flags only support size; everything else
  // supports the full set. Mixed selection = union of capabilities.
  const kinds = selection.map(kindForId)
  const onlyFlag = kinds.every((k) => k === "flag")
  const showBold = !onlyFlag
  const showColor = !onlyFlag

  return (
    <AnimatePresence>
      {visible && (
        <m.div
          data-no-marquee
          layout="position"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
          className="pointer-events-none flex w-full justify-center"
        >
          <Toolbar.Root className="pointer-events-auto flex w-fit max-w-full flex-wrap items-center justify-center gap-1 rounded-2xl border border-white/[0.06] bg-sidebar/90 px-2 py-1.5 shadow-2xl shadow-black/30 backdrop-blur-xl">
            <div className="inline-flex shrink-0 items-center gap-1.5 px-1.5 text-[12px] font-medium">
              <Type className="size-3.5 text-brand" />
              <span className="tabular-nums">
                {selection.length}
                {mapVisible &&
                  (selection.length === 1 ? ` ${t("selection.text")}` : ` ${t("selection.texts")}`)}
              </span>
            </div>

            <Divider />

            {!onlyFlag && (
              <Select
                value={summary.fontFamily ?? DEFAULT_TEXT_STYLE.fontFamily}
                onValueChange={(fontFamily) =>
                  setSelectionStyle({ fontFamily: fontFamily as TextFont })
                }
              >
                <SelectTrigger className="h-7 w-[128px] shrink-0 border-0 bg-white/[0.04] px-2 text-[11px] hover:bg-white/[0.08]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent side="top" align="start" className="z-[2300] max-h-72">
                  {TEXT_FONT_OPTIONS.map((font) => (
                    <SelectItem key={font.id} value={font.id} style={{ fontFamily: font.family }}>
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <div className="inline-flex h-7 shrink-0 items-center gap-2 rounded-lg bg-white/[0.04] px-2">
              <input
                type="number"
                min={MIN_TEXT_SIZE}
                max={MAX_TEXT_SIZE}
                value={summary.fontSize ?? DEFAULT_TEXT_STYLE.fontSize}
                onChange={(e) => setSelectionStyle({ fontSize: normalizeTextSize(e.target.value) })}
                className="number-input-clean h-5 w-8 bg-transparent text-right font-mono text-[10px] text-muted-foreground outline-none"
                aria-label="Text size"
              />
              <input
                type="range"
                min={MIN_TEXT_SIZE}
                max={MAX_TEXT_SIZE}
                value={summary.fontSize ?? DEFAULT_TEXT_STYLE.fontSize}
                onChange={(e) => setSelectionStyle({ fontSize: Number(e.target.value) })}
                className="h-1 w-20 cursor-pointer appearance-none rounded-lg bg-white/[0.08] accent-primary focus:outline-none"
                aria-label="Text size"
              />
            </div>

            {showBold && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toolbar.Button asChild>
                    <button
                      onClick={() => setSelectionStyle({ bold: !summary.bold })}
                      className={cn(
                        "inline-flex size-7 items-center justify-center rounded-lg transition-colors",
                        summary.bold
                          ? "bg-white/[0.1] text-foreground"
                          : "text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
                      )}
                      aria-pressed={summary.bold}
                      aria-label={t("selection.bold")}
                    >
                      <Bold className="size-3.5" />
                    </button>
                  </Toolbar.Button>
                </TooltipTrigger>
                <TooltipContent side="top">{t("selection.bold")}</TooltipContent>
              </Tooltip>
            )}

            {showBold && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Toolbar.Button asChild>
                      <button
                        onClick={() => setSelectionStyle({ italic: !summary.italic })}
                        className={cn(
                          "inline-flex size-7 items-center justify-center rounded-lg transition-colors",
                          summary.italic
                            ? "bg-white/[0.1] text-foreground"
                            : "text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
                        )}
                        aria-pressed={summary.italic}
                        aria-label="Italic"
                      >
                        <Italic className="size-3.5" />
                      </button>
                    </Toolbar.Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Italic</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Toolbar.Button asChild>
                      <button
                        onClick={() => setSelectionStyle({ underline: !summary.underline })}
                        className={cn(
                          "inline-flex size-7 items-center justify-center rounded-lg transition-colors",
                          summary.underline
                            ? "bg-white/[0.1] text-foreground"
                            : "text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
                        )}
                        aria-pressed={summary.underline}
                        aria-label="Underline"
                      >
                        <Underline className="size-3.5" />
                      </button>
                    </Toolbar.Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Underline</TooltipContent>
                </Tooltip>
              </>
            )}

            {showColor && (
              <ColorPickerButton
                value={summary.color}
                rainbow={summary.rainbow}
                onChange={(color: string | null) => setSelectionStyle({ color, rainbow: false })}
                onRainbowChange={(rainbow) => setSelectionStyle({ rainbow })}
              />
            )}

            <Divider />

            <Tooltip>
              <TooltipTrigger asChild>
                <Toolbar.Button asChild>
                  <button
                    onClick={() => setSelectionHidden(!allHidden)}
                    className={cn(
                      "inline-flex size-7 items-center justify-center rounded-lg transition-colors",
                      allHidden
                        ? "bg-white/[0.1] text-foreground"
                        : "text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
                    )}
                    aria-pressed={allHidden}
                    aria-label={allHidden ? t("selection.show") : t("selection.hide")}
                  >
                    {allHidden ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  </button>
                </Toolbar.Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                {allHidden ? t("selection.showSelected") : t("selection.hideSelected")}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Toolbar.Button asChild>
                  <button
                    onClick={resetSelection}
                    className="inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
                    aria-label={t("selection.reset")}
                  >
                    <RotateCcw className="size-3.5" />
                  </button>
                </Toolbar.Button>
              </TooltipTrigger>
              <TooltipContent side="top">{t("selection.resetSelected")}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Toolbar.Button asChild>
                  <button
                    onClick={clearSelection}
                    className="inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
                    aria-label={t("selection.deselect")}
                  >
                    <X className="size-3.5" />
                  </button>
                </Toolbar.Button>
              </TooltipTrigger>
              <TooltipContent side="top">{t("selection.deselect")}</TooltipContent>
            </Tooltip>
          </Toolbar.Root>
        </m.div>
      )}
    </AnimatePresence>
  )
}

function Divider() {
  return <span className="mx-0.5 h-5 w-px bg-white/[0.06]" />
}

function kindForId(id: string): "flag" | "text" {
  if (id === "country.flag") return "flag"
  return "text"
}

function summarize(styles: TextStyle[]): {
  color: string | null
  bold: boolean
  italic: boolean
  underline: boolean
  rainbow: boolean
  fontSize: number | undefined
  fontFamily: TextFont | undefined
} {
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
  const sameColor = styles.every((s) => s.color === first.color)
  const sameBold = styles.every((s) => s.bold === first.bold)
  const sameItalic = styles.every((s) => s.italic === first.italic)
  const sameUnderline = styles.every((s) => s.underline === first.underline)
  const sameRainbow = styles.every((s) => s.rainbow === first.rainbow)
  const sameSize = styles.every((s) => s.fontSize === first.fontSize)
  const sameFont = styles.every((s) => s.fontFamily === first.fontFamily)
  return {
    color: sameColor ? first.color : null,
    bold: sameBold ? first.bold : false,
    italic: sameItalic ? first.italic : false,
    underline: sameUnderline ? first.underline : false,
    rainbow: sameRainbow ? first.rainbow : false,
    fontSize: sameSize ? first.fontSize : undefined,
    fontFamily: sameFont ? first.fontFamily : undefined,
  }
}

function parseColorInput(raw: string): string | null {
  const s = raw.trim()
  const hex = s.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i)
  if (hex) {
    const h = hex[1]
    return h.length === 3 ? "#" + h[0] + h[0] + h[1] + h[1] + h[2] + h[2] : "#" + h
  }
  const rgb = s.match(/^(?:rgb\s*\(\s*)?(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)?$/)
  if (rgb) {
    const [r, g, b] = [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])]
    if (r <= 255 && g <= 255 && b <= 255) {
      return "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")
    }
  }
  return null
}

function ColorPickerButton({
  value,
  rainbow,
  onChange,
  onRainbowChange,
}: {
  value: string | null
  rainbow: boolean
  onChange: (color: string | null) => void
  onRainbowChange: (rainbow: boolean) => void
}) {
  const [open, setOpen] = useState(false)
  const [inputVal, setInputVal] = useState(value ?? "")
  const [invalid, setInvalid] = useState(false)
  const rainbowClicks = useRef<number[]>([])
  const swatchColor = value ?? "var(--foreground)"

  useEffect(() => {
    if (!open) queueMicrotask(() => setInputVal(value ?? ""))
  }, [value, open])

  const handleChange = useCallback(
    (color: unknown) => {
      if (typeof color === "string") {
        onChange(color)
        setInputVal(color)
        setInvalid(false)
      } else if (Array.isArray(color)) {
        const hex =
          "#" +
          color
            .slice(0, 3)
            .map((c: number) => Math.round(c).toString(16).padStart(2, "0"))
            .join("")
        onChange(hex)
        setInputVal(hex)
        setInvalid(false)
      }
    },
    [onChange]
  )

  function commitInput(raw: string) {
    const parsed = parseColorInput(raw)
    if (parsed) {
      onChange(parsed)
      setInputVal(parsed)
      setInvalid(false)
    } else {
      setInvalid(true)
    }
  }

  function handleSwatchClick() {
    const now = Date.now()
    rainbowClicks.current = [...rainbowClicks.current.filter((time) => now - time <= 10_000), now]
    if (rainbowClicks.current.length >= 10) {
      rainbowClicks.current = []
      onRainbowChange(!rainbow)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={handleSwatchClick}
          className={cn(
            "relative size-7 shrink-0 overflow-hidden rounded-lg ring-1 ring-white/[0.1] transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            rainbow && "animate-rainbow-swatch bg-[length:220%_100%]"
          )}
          style={{
            backgroundColor: rainbow ? undefined : swatchColor,
            backgroundImage: rainbow
              ? "linear-gradient(90deg, #ff3355, #ff9f1c, #f7ff00, #2ee66b, #18c8ff, #7c5cff, #ff4fd8, #ff3355)"
              : undefined,
          }}
          title={
            rainbow
              ? "Rainbow on. Click 10x in 10s to turn off."
              : "Click 10x in 10s for rainbow text."
          }
        />
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        sideOffset={10}
        collisionPadding={12}
        avoidCollisions
        className="z-[2200] w-64 p-4 border border-white/[0.08] bg-popover rounded-lg shadow-2xl backdrop-blur-lg"
      >
        <ColorPicker
          value={value ?? "#f9f9f9"}
          onChange={handleChange}
          className="flex flex-col gap-3"
        >
          <ColorPickerSelection className="h-32 rounded-lg" />
          <ColorPickerHue />
        </ColorPicker>
        <div className="mt-2 flex items-center gap-2 border-t border-white/[0.06] pt-2">
          <div
            className={cn(
              "size-5 shrink-0 rounded-full ring-1 ring-white/[0.1]",
              rainbow && "animate-rainbow-swatch bg-[length:220%_100%]"
            )}
            style={{
              backgroundColor: rainbow ? undefined : swatchColor,
              backgroundImage: rainbow
                ? "linear-gradient(90deg, #ff3355, #ff9f1c, #f7ff00, #2ee66b, #18c8ff, #7c5cff, #ff4fd8, #ff3355)"
                : undefined,
            }}
          />
          <input
            className={cn(
              "h-7 flex-1 rounded-md border px-2 text-[11px] font-mono bg-background outline-none transition-colors",
              invalid ? "border-red-500 text-red-500" : "border-white/[0.08] focus:border-brand/40"
            )}
            value={inputVal}
            placeholder="#rrggbb or r, g, b"
            onChange={(e) => {
              setInputVal(e.target.value)
              setInvalid(false)
            }}
            onBlur={(e) => commitInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitInput(inputVal)
            }}
            onPaste={(e) => {
              const pasted = e.clipboardData.getData("text")
              e.preventDefault()
              commitInput(pasted)
            }}
          />
          {rainbow && (
            <button
              type="button"
              onClick={() => onRainbowChange(false)}
              className="shrink-0 rounded px-1 text-[10px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              title="Disable rainbow"
            >
              RGB
            </button>
          )}
          {value && !rainbow && (
            <button
              type="button"
              onClick={() => {
                onChange(null)
                setInputVal("")
                setInvalid(false)
              }}
              className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
              title="Reset"
            >
              <RotateCcw className="size-3.5" />
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
