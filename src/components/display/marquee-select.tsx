import { useEffect, useRef, useState } from "react"

import { useDisplayStore } from "@/lib/display-store"

type Rect = { x: number; y: number; w: number; h: number }

function rectsIntersect(a: Rect, b: DOMRect): boolean {
  return !(a.x + a.w < b.left || a.x > b.right || a.y + a.h < b.top || a.y > b.bottom)
}

export function MarqueeSelect({ children }: { children: React.ReactNode }) {
  const editing = useDisplayStore((s) => s.editing)
  const setSelection = useDisplayStore((s) => s.setSelection)
  const addToSelection = useDisplayStore((s) => s.addToSelection)
  const clearSelection = useDisplayStore((s) => s.clearSelection)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const [drag, setDrag] = useState<null | {
    startX: number
    startY: number
    currentX: number
    currentY: number
    additive: boolean
  }>(null)

  useEffect(() => {
    if (!drag) return

    function onMove(event: PointerEvent) {
      setDrag((prev) =>
        prev ? { ...prev, currentX: event.clientX, currentY: event.clientY } : prev
      )
    }

    function onUp() {
      setDrag((prev) => {
        if (!prev) return null
        const rect = normalizeRect(prev.startX, prev.startY, prev.currentX, prev.currentY)
        // Treat a tiny drag like a plain click on background.
        if (rect.w < 4 && rect.h < 4) {
          if (!prev.additive) clearSelection()
          return null
        }

        const root = containerRef.current ?? document
        const nodes = root.querySelectorAll<HTMLElement>("[data-text-id]")
        const hits: string[] = []
        nodes.forEach((node) => {
          const id = node.dataset.textId
          if (!id) return
          if (rectsIntersect(rect, node.getBoundingClientRect())) hits.push(id)
        })

        if (prev.additive) addToSelection(hits)
        else setSelection(hits)
        return null
      })
    }

    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
    window.addEventListener("pointercancel", onUp)
    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      window.removeEventListener("pointercancel", onUp)
    }
  }, [drag, addToSelection, clearSelection, setSelection])

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!editing) return
    if (event.button !== 0) return
    // Only marquee when clicking on the container background, not on selectable text
    // or interactive elements (handled via stopPropagation on those).
    const target = event.target as HTMLElement
    if (target.closest("[data-text-id], button, input, [role='button'], a, [data-no-marquee]")) {
      return
    }
    setDrag({
      startX: event.clientX,
      startY: event.clientY,
      currentX: event.clientX,
      currentY: event.clientY,
      additive: event.shiftKey || event.ctrlKey || event.metaKey,
    })
  }

  const overlay = drag
    ? normalizeRect(drag.startX, drag.startY, drag.currentX, drag.currentY)
    : null

  return (
    <div
      ref={containerRef}
      onPointerDown={onPointerDown}
      className={editing ? "select-none" : undefined}
      style={{ touchAction: editing ? "none" : undefined }}
    >
      {children}
      {overlay && overlay.w + overlay.h > 4 && (
        <div
          aria-hidden
          className="pointer-events-none fixed z-[2500] rounded-sm border border-brand/70 bg-brand/10"
          style={{
            left: overlay.x,
            top: overlay.y,
            width: overlay.w,
            height: overlay.h,
          }}
        />
      )}
    </div>
  )
}

function normalizeRect(x1: number, y1: number, x2: number, y2: number): Rect {
  const x = Math.min(x1, x2)
  const y = Math.min(y1, y2)
  const w = Math.abs(x2 - x1)
  const h = Math.abs(y2 - y1)
  return { x, y, w, h }
}
