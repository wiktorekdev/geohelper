import { m, AnimatePresence } from "motion/react"
import { Bold, Eye, EyeOff, Italic, RotateCcw, Type, Underline, X } from "lucide-react"
import * as Toolbar from "@radix-ui/react-toolbar"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DEFAULT_TEXT_STYLE,
  MAX_TEXT_SIZE,
  MIN_TEXT_SIZE,
  TEXT_FONT_OPTIONS,
  normalizeTextSize,
  useDisplayStore,
  type TextFont,
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
import { selectionKind, summarizeSelectionStyles } from "./selection-toolbar-model"
import { SelectionColorPicker } from "./selection-color-picker"

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

  const summary = summarizeSelectionStyles(
    selection.map((id) => textStyles[id] ?? DEFAULT_TEXT_STYLE)
  )

  const allHidden = selection.every((id) => hiddenTexts[id] === true)

  // Capability flags vary by element kind. Flags only support size; everything else
  // supports the full set. Mixed selection = union of capabilities.
  const kinds = selection.map(selectionKind)
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
              <SelectionColorPicker
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
