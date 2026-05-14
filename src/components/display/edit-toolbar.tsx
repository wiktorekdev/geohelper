import { Check, Map, MapPinOff, Pencil, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useDisplayStore } from "@/lib/display-store";
import { clearMockIfPresent } from "@/lib/mock-data";

export function EditToolbar() {
  const editing = useDisplayStore((s) => s.editing);
  const stopEditing = useDisplayStore((s) => s.stopEditing);
  const resetAll = useDisplayStore((s) => s.resetAll);
  const mapVisible = useDisplayStore((s) => s.mapVisible);
  const setMapVisible = useDisplayStore((s) => s.setMapVisible);

  if (!editing) return null;

  function finishEditing() {
    clearMockIfPresent();
    stopEditing();
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-50 flex justify-center px-2">
      <div className="pointer-events-auto flex max-w-[calc(100vw-16px)] flex-wrap items-center justify-center gap-1 rounded-xl border border-sidebar-border bg-sidebar/95 px-2 py-1.5 shadow-lg backdrop-blur">
        <div className="inline-flex min-w-0 items-center gap-1.5 px-1.5 text-[12px] font-medium">
          <Pencil className="size-3.5 text-brand" />
          <span className="leading-tight">Editing layout</span>
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
              {mapVisible ? "Hide map" : "Show map"}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            {mapVisible ? "Hide the map to save tile requests" : "Bring the map back"}
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
                toast.success("Layout reset");
              }}
            >
              <RotateCcw className="size-3.5" />
              Reset
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">Reset all sections</TooltipContent>
        </Tooltip>

        <Button
          size="sm"
          className="h-7 gap-1.5 rounded-full px-2.5 text-xs"
          onClick={finishEditing}
        >
          <Check className="size-3.5" />
          Done
        </Button>
      </div>
    </div>
  );
}
