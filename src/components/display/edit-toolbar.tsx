import { Check, Map, MapPinOff, Pencil, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useDisplayStore } from "@/lib/display-store";

export function EditToolbar() {
  const editing = useDisplayStore((s) => s.editing);
  const stopEditing = useDisplayStore((s) => s.stopEditing);
  const resetAll = useDisplayStore((s) => s.resetAll);
  const mapVisible = useDisplayStore((s) => s.mapVisible);
  const setMapVisible = useDisplayStore((s) => s.setMapVisible);

  if (!editing) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center">
      <div className="pointer-events-auto inline-flex items-center gap-1 rounded-full border border-sidebar-border bg-sidebar/95 px-3 py-1.5 shadow-lg backdrop-blur">
        <div className="inline-flex items-center gap-2 pl-1 pr-2 text-[12px] font-medium">
          <Pencil className="h-3.5 w-3.5 text-brand" />
          <span>Editing layout</span>
        </div>
        <Separator orientation="vertical" className="h-5" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 rounded-full px-2.5 text-xs"
              onClick={() => setMapVisible(!mapVisible)}
            >
              {mapVisible ? <Map className="h-3.5 w-3.5" /> : <MapPinOff className="h-3.5 w-3.5" />}
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
              className="h-7 gap-1.5 rounded-full px-2.5 text-xs"
              onClick={() => {
                resetAll();
                toast.success("Layout reset");
              }}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">Reset all sections</TooltipContent>
        </Tooltip>

        <Button
          size="sm"
          className="h-7 gap-1.5 rounded-full px-3 text-xs"
          onClick={stopEditing}
        >
          <Check className="h-3.5 w-3.5" />
          Done
        </Button>
      </div>
    </div>
  );
}
