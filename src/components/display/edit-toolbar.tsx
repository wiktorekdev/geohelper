import { m, AnimatePresence } from "motion/react"
import { Check, Map, MapPin, MapPinOff, Pencil, RotateCcw } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Toolbar, ToolbarButton } from "@/components/ui/toolbar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useDisplayStore } from "@/lib/display-store"
import { clearMockIfPresent } from "@/lib/mock-data"
import { useT } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export function EditToolbar() {
  const t = useT()
  const editing = useDisplayStore((s) => s.editing)
  const stopEditing = useDisplayStore((s) => s.stopEditing)
  const resetAll = useDisplayStore((s) => s.resetAll)
  const mapVisible = useDisplayStore((s) => s.mapVisible)
  const setMapVisible = useDisplayStore((s) => s.setMapVisible)
  const sidebarWidth = useDisplayStore((s) => s.sidebarWidth)
  const markerToolbarOpen = useDisplayStore((s) => s.markerToolbarOpen)
  const setMarkerToolbarOpen = useDisplayStore((s) => s.setMarkerToolbarOpen)

  function finishEditing() {
    clearMockIfPresent()
    stopEditing()
  }

  return (
    <AnimatePresence>
      {editing && (
        <m.div
          initial={{ opacity: 0, y: 15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.95 }}
          transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
          className="pointer-events-none fixed inset-x-0 z-[2000] flex justify-center px-2 transition-[bottom,left] duration-500"
          style={{ left: mapVisible ? sidebarWidth : 0, bottom: mapVisible ? 12 : 54 }}
        >
          <Toolbar className="pointer-events-auto flex max-w-[calc(100vw-16px)] flex-nowrap items-center justify-center gap-1 whitespace-nowrap rounded-xl border border-sidebar-border bg-sidebar/95 px-2 py-1.5 shadow-xl backdrop-blur">
            <div className="inline-flex shrink-0 items-center gap-1.5 px-1 text-[12px] font-medium">
              <Pencil className="size-3.5 text-brand" />
              {mapVisible && <span className="leading-tight">{t("toolbar.editing")}</span>}
            </div>

            <Tooltip>
              <TooltipTrigger
                render={
                  <ToolbarButton
                    render={
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
                        {mapVisible && t("toolbar.hideMap")}
                        {!mapVisible && <span className="sr-only">{t("toolbar.showMap")}</span>}
                      </Button>
                    }
                  />
                }
              />
              <TooltipContent side="top">
                {mapVisible ? t("toolbar.hideMapTooltip") : t("toolbar.showMapTooltip")}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <ToolbarButton
                    render={
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
                    }
                  />
                }
              />
              <TooltipContent side="top">{t("marker.customizeTitle")}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <ToolbarButton
                    render={
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 shrink-0 gap-1.5 rounded-full px-2 text-xs"
                        onClick={() => {
                          resetAll()
                          toast.success(t("toolbar.resetSuccess"))
                        }}
                        title={t("toolbar.reset")}
                      >
                        <RotateCcw className="size-3.5" />
                        {mapVisible && t("toolbar.reset")}
                        {!mapVisible && <span className="sr-only">{t("toolbar.reset")}</span>}
                      </Button>
                    }
                  />
                }
              />
              <TooltipContent side="top">{t("toolbar.resetTooltip")}</TooltipContent>
            </Tooltip>

            <ToolbarButton
              render={
                <Button
                  size="sm"
                  className="h-7 shrink-0 gap-1.5 rounded-full px-2.5 text-xs"
                  onClick={finishEditing}
                  title={t("toolbar.done")}
                >
                  <Check className="size-3.5" />
                  {mapVisible && t("toolbar.done")}
                  {!mapVisible && <span className="sr-only">{t("toolbar.done")}</span>}
                </Button>
              }
            />
          </Toolbar>
        </m.div>
      )}
    </AnimatePresence>
  )
}
