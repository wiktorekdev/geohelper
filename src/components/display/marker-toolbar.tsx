import { m, AnimatePresence } from "motion/react"
import { MapPin, RotateCcw } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import * as Toolbar from "@radix-ui/react-toolbar"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ColorPicker, ColorPickerHue, ColorPickerSelection } from "@/components/ui/color-picker"
import { useDisplayStore } from "@/lib/display-store"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { useT } from "@/lib/i18n"

const DEFAULT_MARKER_COLOR = "#818cf8"
const DEFAULT_MARKER_BORDER = "#ffffff"
const DEFAULT_MARKER_SIZE = 24
const MARKER_MIN_SIZE = 8
const MARKER_MAX_SIZE = 96

type MarkerColorButtonProps = {
  label: string
  value: string
  onChange: (value: string) => void
}

function parseColorInput(raw: string): string | null {
  const s = raw.trim()
  const hex = s.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i)
  if (!hex) return null
  const h = hex[1]
  return h.length === 3 ? "#" + h[0] + h[0] + h[1] + h[1] + h[2] + h[2] : "#" + h
}

function MarkerColorButton({ label, value, onChange }: MarkerColorButtonProps) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const [invalid, setInvalid] = useState(false)

  useEffect(() => {
    if (!open) queueMicrotask(() => setInputValue(value))
  }, [value, open])

  const handleChange = useCallback(
    (color: unknown) => {
      if (typeof color !== "string") return
      onChange(color)
      setInputValue(color)
      setInvalid(false)
    },
    [onChange]
  )

  function commitInput(raw: string) {
    const parsed = parseColorInput(raw)
    if (parsed) {
      onChange(parsed)
      setInputValue(parsed)
      setInvalid(false)
    } else {
      setInvalid(true)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-white/[0.04] px-2 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-white/[0.08] hover:text-foreground"
          aria-label={label}
          title={label}
        >
          <span
            className="size-3 rounded-full ring-1 ring-white/[0.1]"
            style={{ backgroundColor: value }}
          />
          <span className="min-w-0 truncate font-mono text-[10px] uppercase">
            {value.replace("#", "")}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="center"
        sideOffset={10}
        collisionPadding={12}
        className="z-[2300] w-64 rounded-lg border border-white/[0.08] bg-popover p-4 shadow-2xl backdrop-blur-lg"
      >
        <ColorPicker value={value} onChange={handleChange} className="flex flex-col gap-3">
          <ColorPickerSelection className="h-32 rounded-lg" />
          <ColorPickerHue />
        </ColorPicker>
        <div className="mt-2 flex items-center gap-2 border-t border-white/[0.06] pt-2">
          <div
            className="size-5 shrink-0 rounded-full ring-1 ring-white/[0.1]"
            style={{ backgroundColor: value }}
          />
          <input
            className={cn(
              "h-7 flex-1 rounded-md border bg-background px-2 font-mono text-[11px] outline-none transition-colors",
              invalid ? "border-red-500 text-red-500" : "border-white/[0.08] focus:border-brand/40"
            )}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value)
              setInvalid(false)
            }}
            onBlur={(e) => commitInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitInput(inputValue)
            }}
            onPaste={(e) => {
              const pasted = e.clipboardData.getData("text")
              e.preventDefault()
              commitInput(pasted)
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function MarkerToolbar() {
  const t = useT()
  const editing = useDisplayStore((s) => s.editing)
  const open = useDisplayStore((s) => s.markerToolbarOpen)
  const mapVisible = useDisplayStore((s) => s.mapVisible)

  const markerColor = useStore((s) => s.markerColor)
  const setMarkerColor = useStore((s) => s.setMarkerColor)
  const markerBorderColor = useStore((s) => s.markerBorderColor)
  const setMarkerBorderColor = useStore((s) => s.setMarkerBorderColor)
  const markerSize = useStore((s) => s.markerSize)
  const setMarkerSize = useStore((s) => s.setMarkerSize)

  const visible = editing && open

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
          <Toolbar.Root className="pointer-events-auto flex w-fit max-w-full flex-wrap items-center justify-center gap-1 rounded-2xl border border-white/[0.06] bg-sidebar/90 backdrop-blur-xl px-2 py-1.5 shadow-lg backdrop-blur">
            <div className="inline-flex shrink-0 items-center gap-1.5 px-1 text-[12px] font-medium">
              <MapPin className="size-3.5 text-brand" />
              {mapVisible && (
                <span className="hidden min-[420px]:inline">{t("marker.customizeTitle")}</span>
              )}
            </div>

            <Divider />

            <MarkerColorButton
              label={t("marker.color")}
              value={markerColor}
              onChange={setMarkerColor}
            />
            <MarkerColorButton
              label={t("marker.borderColor")}
              value={markerBorderColor}
              onChange={setMarkerBorderColor}
            />

            <Divider />

            <div className="inline-flex h-7 shrink-0 items-center gap-2 rounded-lg bg-white/[0.04] px-2">
              <input
                type="number"
                min={MARKER_MIN_SIZE}
                max={MARKER_MAX_SIZE}
                value={markerSize}
                onChange={(e) => setMarkerSize(Number(e.target.value))}
                className="number-input-clean h-5 w-8 bg-transparent text-right font-mono text-[10px] text-muted-foreground outline-none"
                aria-label={t("marker.size")}
              />
              <input
                type="range"
                min={MARKER_MIN_SIZE}
                max={MARKER_MAX_SIZE}
                value={markerSize}
                onChange={(e) => setMarkerSize(Number(e.target.value))}
                className={cn(
                  "h-1 cursor-pointer appearance-none rounded-lg bg-white/[0.08] accent-primary focus:outline-none",
                  mapVisible ? "w-20" : "w-16"
                )}
                aria-label={t("marker.size")}
              />
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Toolbar.Button asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 rounded-md"
                    onClick={() => {
                      setMarkerColor(DEFAULT_MARKER_COLOR)
                      setMarkerBorderColor(DEFAULT_MARKER_BORDER)
                      setMarkerSize(DEFAULT_MARKER_SIZE)
                    }}
                    aria-label={t("selection.reset")}
                  >
                    <RotateCcw className="size-3.5" />
                  </Button>
                </Toolbar.Button>
              </TooltipTrigger>
              <TooltipContent side="top">{t("selection.reset")}</TooltipContent>
            </Tooltip>
          </Toolbar.Root>
        </m.div>
      )}
    </AnimatePresence>
  )
}

function Divider() {
  return <span className="mx-0.5 h-4 w-px bg-white/[0.06]" />
}
