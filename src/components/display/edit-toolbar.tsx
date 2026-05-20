import { m, AnimatePresence } from "framer-motion";
import { Check, Map, MapPinOff, Pencil, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useDisplayStore } from "@/lib/display-store";
import { clearMockIfPresent } from "@/lib/mock-data";
import { useT } from "@/lib/i18n";

export function EditToolbar() {
  const t = useT();
  const editing = useDisplayStore((s) => s.editing);
  const stopEditing = useDisplayStore((s) => s.stopEditing);
  const resetAll = useDisplayStore((s) => s.resetAll);
  const mapVisible = useDisplayStore((s) => s.mapVisible);
  const setMapVisible = useDisplayStore((s) => s.setMapVisible);
  const sidebarWidth = useDisplayStore((s) => s.sidebarWidth);

  function finishEditing() {
    clearMockIfPresent();
    stopEditing();
  }

  return (
    <AnimatePresence>
      {editing && (
        <m.div
          initial={{ opacity: 0, y: 15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.95 }}
          transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
          className="pointer-events-none fixed inset-x-0 bottom-3 z-[2000] flex justify-center px-2 transition-[left] duration-500"
          style={{ left: mapVisible ? sidebarWidth : 0 }}
        >
          <div className="pointer-events-auto flex max-w-[calc(100vw-16px)] flex-wrap items-center justify-center gap-1 rounded-xl border border-sidebar-border bg-sidebar/95 px-2 py-1.5 shadow-xl backdrop-blur">
            <div className="inline-flex min-w-0 items-center gap-1.5 px-1.5 text-[12px] font-medium">
              <Pencil className="size-3.5 text-brand" />
              <span className="leading-tight">{t("toolbar.editing")}</span>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1.5 rounded-full px-2 text-xs"
                  onClick={() => setMapVisible(!mapVisible)}
                >
                  {mapVisible ? <Map className="size-3.5" /> : <MapPinOff className="size-3.5" />}
                  {mapVisible ? t("toolbar.hideMap") : t("toolbar.showMap")}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                {mapVisible ? t("toolbar.hideMapTooltip") : t("toolbar.showMapTooltip")}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1.5 rounded-full px-2 text-xs"
                  onClick={() => {
                    resetAll();
                    toast.success(t("toolbar.resetSuccess"));
                  }}
                >
                  <RotateCcw className="size-3.5" />
                  {t("toolbar.reset")}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">{t("toolbar.resetTooltip")}</TooltipContent>
            </Tooltip>

            <Button
              size="sm"
              className="h-7 gap-1.5 rounded-full px-2.5 text-xs"
              onClick={finishEditing}
            >
              <Check className="size-3.5" />
              {t("toolbar.done")}
            </Button>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
