import { Pencil, Settings as SettingsIcon } from "lucide-react";
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SocialFooter } from "./social-footer";
import { UpdateBanner } from "./update-banner";
import { SortableSection } from "./display/sortable-section";
import { LocationSection } from "./sidebar/location-section";
import { RoadSection } from "./sidebar/road-section";
import { DetailsSection } from "./sidebar/details-section";
import { CoordsSection } from "./sidebar/coords-section";
import { EmptyState } from "./sidebar/empty-state";
import { GeocodeNotice } from "./sidebar/geocode-notice";
import { StatusDot } from "./sidebar/status-dot";
import { useDisplayStore, type WidgetId } from "@/lib/display-store";
import { clearMockIfPresent, injectMockIfEmpty } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import logoUrl from "@/assets/logo.png";

export function Sidebar({ fullWidth = false }: { fullWidth?: boolean }) {
  const openSettings = useStore((s) => s.openSettings);
  const conn = useStore((s) => s.conn);
  const current = useStore((s) => s.current);

  const editing = useDisplayStore((s) => s.editing);
  const toggleEditing = useDisplayStore((s) => s.toggleEditing);
  const order = useDisplayStore((s) => s.order);
  const setOrder = useDisplayStore((s) => s.setOrder);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function handleToggleEditing() {
    if (editing) clearMockIfPresent();
    else injectMockIfEmpty();
    toggleEditing();
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = order.indexOf(active.id as WidgetId);
    const to = order.indexOf(over.id as WidgetId);
    if (from === -1 || to === -1) return;
    setOrder(arrayMove(order, from, to));
  }

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col bg-sidebar border-r border-sidebar-border",
        fullWidth ? "w-full" : "w-[320px]",
        editing && "ring-1 ring-inset ring-brand/20",
      )}
    >
      <header className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <img src={logoUrl} alt="" className="size-8 shrink-0" />
          <div className="text-[15px] font-semibold tracking-tight">GeoHelper</div>
        </div>
        <div className="flex items-center gap-1">
          <StatusDot conn={conn} />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant={editing ? "default" : "ghost"}
                className="size-8"
                onClick={handleToggleEditing}
                aria-pressed={editing}
              >
                <Pencil className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {editing ? "Finish editing" : "Edit layout"}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" className="size-8" onClick={openSettings}>
                <SettingsIcon className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Settings</TooltipContent>
          </Tooltip>
        </div>
      </header>

      <ScrollArea className="flex-1">
        {current || editing ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={order} strategy={verticalListSortingStrategy}>
              <GeocodeNotice />
              {order.map((id) => (
                <SortableSection key={id} id={id}>
                  <WidgetContent id={id} />
                </SortableSection>
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          <EmptyState conn={conn} />
        )}
      </ScrollArea>

      <UpdateBanner />
      <SocialFooter />
    </aside>
  );
}

function WidgetContent({ id }: { id: WidgetId }) {
  switch (id) {
    case "country":
      return <LocationSection />;
    case "road":
      return <RoadSection />;
    case "details":
      return <DetailsSection />;
    case "coordinates":
      return <CoordsSection />;
  }
}
