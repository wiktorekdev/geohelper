import { RotateCcw } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

import { ColorPicker, ColorPickerHue, ColorPickerSelection } from "@/components/ui/color-picker"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { parseColorInput } from "./selection-toolbar-model"

type SelectionColorPickerProps = {
  value: string | null
  rainbow: boolean
  onChange: (color: string | null) => void
  onRainbowChange: (rainbow: boolean) => void
}

export function SelectionColorPicker({
  value,
  rainbow,
  onChange,
  onRainbowChange,
}: SelectionColorPickerProps) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value ?? "")
  const [invalid, setInvalid] = useState(false)
  const rainbowClicks = useRef<number[]>([])
  const swatchColor = value ?? "var(--foreground)"

  useEffect(() => {
    if (!open) queueMicrotask(() => setInputValue(value ?? ""))
  }, [value, open])

  const handleChange = useCallback(
    (color: unknown) => {
      if (typeof color === "string") {
        onChange(color)
        setInputValue(color)
        setInvalid(false)
      } else if (Array.isArray(color)) {
        const hex = `#${color
          .slice(0, 3)
          .map((channel: number) => Math.round(channel).toString(16).padStart(2, "0"))
          .join("")}`
        onChange(hex)
        setInputValue(hex)
        setInvalid(false)
      }
    },
    [onChange]
  )

  const commitInput = (raw: string) => {
    const parsed = parseColorInput(raw)
    if (!parsed) {
      setInvalid(true)
      return
    }
    onChange(parsed)
    setInputValue(parsed)
    setInvalid(false)
  }

  const handleSwatchClick = () => {
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
        className="z-[2200] w-64 rounded-lg border border-white/[0.08] bg-popover p-4 shadow-2xl backdrop-blur-lg"
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
              "h-7 flex-1 rounded-md border bg-background px-2 font-mono text-[11px] outline-none transition-colors",
              invalid ? "border-red-500 text-red-500" : "border-white/[0.08] focus:border-brand/40"
            )}
            value={inputValue}
            placeholder="#rrggbb or r, g, b"
            onChange={(event) => {
              setInputValue(event.target.value)
              setInvalid(false)
            }}
            onBlur={(event) => commitInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") commitInput(inputValue)
            }}
            onPaste={(event) => {
              event.preventDefault()
              commitInput(event.clipboardData.getData("text"))
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
                setInputValue("")
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
