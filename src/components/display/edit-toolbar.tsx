import { m, AnimatePresence } from "motion/react"
import { Check, Map, MapPin, MapPinOff, Pencil, RotateCcw, X } from "lucide-react"
import { useState } from "react"
import toast from "react-hot-toast"
import * as Toolbar from "@radix-ui/react-toolbar"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useDisplayStore } from "@/lib/display-store"
import { useStore } from "@/lib/store"
import { clearMockIfPresent } from "@/lib/mock-data"
import { useT } from "@/lib/i18n"
import { cn } from "@/lib/utils"

const DEFAULT_MARKER_COLOR = "#dc2626"
const DEFAULT_MARKER_BORDER = "#ffffff"
const DEFAULT_MARKER_SIZE = 24

const RESET_ITEMS = [
  {
    id: "order",
    label: "Widget order",
    description: "Country, road, details and coordinates order.",
  },
  {
    id: "text",
    label: "Text styles",
    description: "Fonts, sizes, bold, italic, underline, colors and rainbow.",
  },
  {
    id: "visibility",
    label: "Hidden texts",
    description: "Restores text fields hidden during editing.",
  },
  { id: "panel", label: "Sidebar and map", description: "Sidebar width and map visibility." },
  { id: "marker", label: "Marker style", description: "Marker colors and size." },
] as const

type ResetItemId = (typeof RESET_ITEMS)[number]["id"]

export function EditToolbar() {
  const t = useT()
  const editing = useDisplayStore((s) => s.editing)
  const stopEditing = useDisplayStore((s) => s.stopEditing)
  const resetParts = useDisplayStore((s) => s.resetParts)
  const mapVisible = useDisplayStore((s) => s.mapVisible)
  const setMapVisible = useDisplayStore((s) => s.setMapVisible)
  const markerToolbarOpen = useDisplayStore((s) => s.markerToolbarOpen)
  const setMarkerToolbarOpen = useDisplayStore((s) => s.setMarkerToolbarOpen)
  const setMarkerColor = useStore((s) => s.setMarkerColor)
  const setMarkerBorderColor = useStore((s) => s.setMarkerBorderColor)
  const setMarkerSize = useStore((s) => s.setMarkerSize)
  const [resetOpen, setResetOpen] = useState(false)
  const [resetSelection, setResetSelection] = useState<Record<ResetItemId, boolean>>({
    order: true,
    text: true,
    visibility: true,
    panel: false,
    marker: true,
  })

  function finishEditing() {
    clearMockIfPresent()
    stopEditing()
  }

  function applyReset() {
    resetParts({
      order: resetSelection.order,
      text: resetSelection.text,
      visibility: resetSelection.visibility,
      panel: resetSelection.panel,
    })
    if (resetSelection.marker) {
      setMarkerColor(DEFAULT_MARKER_COLOR)
      setMarkerBorderColor(DEFAULT_MARKER_BORDER)
      setMarkerSize(DEFAULT_MARKER_SIZE)
    }
    setResetOpen(false)
    toast.success("Reset applied")
  }

  return (
    <>
      <AnimatePresence>
        {editing && (
          <m.div
            layout="position"
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
            className="pointer-events-none flex w-full justify-center"
          >
            <Toolbar.Root className="pointer-events-auto flex w-fit max-w-full flex-wrap items-center justify-center gap-1 whitespace-nowrap rounded-xl border border-sidebar-border bg-sidebar/95 px-2 py-1.5 shadow-xl backdrop-blur">
              <div className="inline-flex shrink-0 items-center gap-1.5 px-1 text-[12px] font-medium">
                <Pencil className="size-3.5 text-brand" />
                {mapVisible && (
                  <span className="hidden leading-tight min-[420px]:inline">
                    {t("toolbar.editing")}
                  </span>
                )}
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Toolbar.Button asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 shrink-0 gap-1.5 rounded-full px-2 text-xs"
                      onClick={() => setMapVisible(!mapVisible)}
                      title={mapVisible ? t("toolbar.hideMap") : t("toolbar.showMap")}
                    >
                      {mapVisible ? (
                        <Map className="size-3.5" />
                      ) : (
                        <MapPinOff className="size-3.5" />
                      )}
                      {mapVisible && (
                        <span className="hidden min-[420px]:inline">{t("toolbar.hideMap")}</span>
                      )}
                      {!mapVisible && <span className="sr-only">{t("toolbar.showMap")}</span>}
                    </Button>
                  </Toolbar.Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  {mapVisible ? t("toolbar.hideMapTooltip") : t("toolbar.showMapTooltip")}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Toolbar.Button asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "size-7 shrink-0 rounded-full",
                        markerToolbarOpen && "bg-accent text-foreground"
                      )}
                      aria-label={t("marker.customizeTitle")}
                      title={t("marker.customizeTitle")}
                      aria-pressed={markerToolbarOpen}
                      onClick={() => setMarkerToolbarOpen(!markerToolbarOpen)}
                    >
                      <MapPin className="size-3.5" />
                    </Button>
                  </Toolbar.Button>
                </TooltipTrigger>
                <TooltipContent side="top">{t("marker.customizeTitle")}</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Toolbar.Button asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 shrink-0 gap-1.5 rounded-full px-2 text-xs"
                      onClick={() => setResetOpen(true)}
                      title={t("toolbar.reset")}
                    >
                      <RotateCcw className="size-3.5" />
                      {mapVisible && (
                        <span className="hidden min-[420px]:inline">{t("toolbar.reset")}</span>
                      )}
                      {!mapVisible && <span className="sr-only">{t("toolbar.reset")}</span>}
                    </Button>
                  </Toolbar.Button>
                </TooltipTrigger>
                <TooltipContent side="top">{t("toolbar.resetTooltip")}</TooltipContent>
              </Tooltip>

              <Toolbar.Button asChild>
                <Button
                  size="sm"
                  className="h-7 shrink-0 gap-1.5 rounded-full px-2.5 text-xs"
                  onClick={finishEditing}
                  title={t("toolbar.done")}
                >
                  <Check className="size-3.5" />
                  {mapVisible && (
                    <span className="hidden min-[420px]:inline">{t("toolbar.done")}</span>
                  )}
                  {!mapVisible && <span className="sr-only">{t("toolbar.done")}</span>}
                </Button>
              </Toolbar.Button>
            </Toolbar.Root>
          </m.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {resetOpen && (
          <m.div
            className="pointer-events-auto fixed inset-0 z-[2600] flex items-end justify-center bg-black/35 px-3 pb-20 backdrop-blur-sm sm:items-center sm:pb-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={() => setResetOpen(false)}
          >
            <m.div
              className="w-full max-w-[360px] overflow-hidden rounded-xl border border-sidebar-border bg-sidebar/95 shadow-2xl backdrop-blur-md"
              initial={{ y: 18, scale: 0.96 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 18, scale: 0.96 }}
              transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-sidebar-border/60 px-4 py-3">
                <div>
                  <div className="text-sm font-semibold text-foreground">Reset layout</div>
                  <div className="text-[11px] text-muted-foreground">
                    Choose what should go back to default.
                  </div>
                </div>
                <button
                  type="button"
                  className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                  onClick={() => setResetOpen(false)}
                  aria-label="Close reset dialog"
                >
                  <X className="size-3.5" />
                </button>
              </div>

              <div className="space-y-1.5 p-3">
                {RESET_ITEMS.map((item) => (
                  <label
                    key={item.id}
                    className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-accent/50"
                  >
                    <input
                      type="checkbox"
                      checked={resetSelection[item.id]}
                      onChange={(event) =>
                        setResetSelection((current) => ({
                          ...current,
                          [item.id]: event.target.checked,
                        }))
                      }
                      className="mt-0.5 size-4 accent-primary"
                    />
                    <span className="min-w-0">
                      <span className="block text-xs font-medium text-foreground">
                        {item.label}
                      </span>
                      <span className="block text-[11px] leading-snug text-muted-foreground">
                        {item.description}
                      </span>
                    </span>
                  </label>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-sidebar-border/60 px-4 py-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => setResetOpen(false)}
                >
                  Cancel
                </Button>
                <Button size="sm" className="h-8 text-xs" onClick={applyReset}>
                  Reset selected
                </Button>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  )
}
