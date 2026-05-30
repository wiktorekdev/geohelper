"use client"

import { colord } from "colord"
import { Slider as SliderPrimitive } from "@base-ui/react/slider"
import {
  type ComponentProps,
  createContext,
  type HTMLAttributes,
  memo,
  useCallback,
  useEffect,
  use,
  useRef,
  useState,
} from "react"
import { cn } from "@/lib/utils"

interface ColorPickerContextValue {
  hue: number
  saturation: number
  lightness: number
  setHue: (hue: number) => void
  setSaturation: (saturation: number) => void
  setLightness: (lightness: number) => void
}

const ColorPickerContext = createContext<ColorPickerContextValue | undefined>(undefined)

export const useColorPicker = () => {
  const context = use(ColorPickerContext)

  if (!context) {
    throw new Error("useColorPicker must be used within a ColorPickerProvider")
  }

  return context
}

export type ColorPickerProps = HTMLAttributes<HTMLDivElement> & {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
}

function parseToHsl(v: string) {
  try {
    const c = colord(v)
    const hsl = c.toHsl()
    return { hue: hsl.h, saturation: hsl.s, lightness: hsl.l }
  } catch {
    return { hue: 0, saturation: 100, lightness: 50 }
  }
}

export const ColorPicker = ({
  value,
  defaultValue = "#000000",
  onChange,
  className,
  ...props
}: ColorPickerProps) => {
  const initial = parseToHsl(value ?? defaultValue)

  const [hue, setHue] = useState(initial.hue)
  const [saturation, setSaturation] = useState(initial.saturation)
  const [lightness, setLightness] = useState(initial.lightness)

  const mounted = useRef(false)
  const isInternalChange = useRef(false)

  useEffect(() => {
    mounted.current = true
  }, [])

  // Sync when controlled value changes externally
  useEffect(() => {
    if (!mounted.current) return
    if (isInternalChange.current) {
      isInternalChange.current = false
      return
    }
    if (value) {
      const { hue: h, saturation: s, lightness: l } = parseToHsl(value)
      queueMicrotask(() => {
        setHue(h)
        setSaturation(s)
        setLightness(l)
      })
    }
  }, [value])

  // Notify parent of changes (skip first render)
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  })

  useEffect(() => {
    if (!mounted.current) return
    isInternalChange.current = true
    if (onChangeRef.current) {
      const color = colord({ h: hue, s: saturation, l: lightness })
      onChangeRef.current(color.toHex())
    }
  }, [hue, saturation, lightness])

  return (
    <ColorPickerContext.Provider
      value={{
        hue,
        saturation,
        lightness,
        setHue,
        setSaturation,
        setLightness,
      }}
    >
      <div className={cn("flex size-full flex-col gap-4", className)} {...props} />
    </ColorPickerContext.Provider>
  )
}

export type ColorPickerSelectionProps = HTMLAttributes<HTMLDivElement>

export const ColorPickerSelection = memo(({ className, ...props }: ColorPickerSelectionProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const { hue, saturation, lightness, setSaturation, setLightness } = useColorPicker()

  // Derive position from context instead of storing separately
  const positionX = saturation / 100
  const topLightness = positionX < 0.01 ? 100 : 50 + 50 * (1 - positionX)
  const positionY = lightness <= 0 ? 1 : Math.max(0, Math.min(1, 1 - lightness / topLightness))

  const backgroundGradient = `linear-gradient(0deg, rgba(0,0,0,1), rgba(0,0,0,0)),
            linear-gradient(90deg, rgba(255,255,255,1), rgba(255,255,255,0)),
            hsl(${hue}, 100%, 50%)`

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      if (!containerRef.current) {
        return
      }
      const rect = containerRef.current.getBoundingClientRect()
      const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width))
      const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height))
      setSaturation(x * 100)
      const topLightness = x < 0.01 ? 100 : 50 + 50 * (1 - x)
      const lightness = topLightness * (1 - y)

      setLightness(lightness)
    },
    [setSaturation, setLightness]
  )

  const handlePointerMoveRef = useRef(handlePointerMove)
  useEffect(() => {
    handlePointerMoveRef.current = handlePointerMove
  })

  useEffect(() => {
    if (!isDragging) return

    const handlePointerUp = () => setIsDragging(false)
    const onPointerMove = (event: PointerEvent) => {
      handlePointerMoveRef.current(event)
    }

    window.addEventListener("pointermove", onPointerMove)
    window.addEventListener("pointerup", handlePointerUp)

    return () => {
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [isDragging])

  return (
    <div
      className={cn("relative size-full cursor-crosshair rounded", className)}
      onPointerDown={(e) => {
        e.preventDefault()
        setIsDragging(true)
        handlePointerMove(e.nativeEvent)
      }}
      ref={containerRef}
      style={{
        background: backgroundGradient,
      }}
      {...props}
    >
      <div
        className="-translate-x-1/2 -translate-y-1/2 pointer-events-none absolute size-4 rounded-full border-2 border-white"
        style={{
          left: `${positionX * 100}%`,
          top: `${positionY * 100}%`,
          boxShadow: "0 0 0 1px rgba(0,0,0,0.5)",
        }}
      />
    </div>
  )
})

ColorPickerSelection.displayName = "ColorPickerSelection"

export type ColorPickerHueProps = ComponentProps<typeof SliderPrimitive.Root>

export const ColorPickerHue = ({ className, ...props }: ColorPickerHueProps) => {
  const { hue, setHue } = useColorPicker()

  return (
    <SliderPrimitive.Root
      className={cn("relative flex h-4 w-full touch-none", className)}
      max={360}
      onValueChange={(value) => setHue(Array.isArray(value) ? value[0] : value)}
      step={1}
      value={hue}
      {...props}
    >
      <SliderPrimitive.Control className="flex h-4 w-full items-center">
        <SliderPrimitive.Track className="relative my-0.5 h-3 w-full grow rounded-full bg-[linear-gradient(90deg,#FF0000,#FFFF00,#00FF00,#00FFFF,#0000FF,#FF00FF,#FF0000)]">
          <SliderPrimitive.Thumb
            index={0}
            className="block size-4 rounded-full border border-primary/50 bg-background shadow outline-none transition-colors focus-visible:ring-1 focus-visible:ring-ring"
          />
        </SliderPrimitive.Track>
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}
