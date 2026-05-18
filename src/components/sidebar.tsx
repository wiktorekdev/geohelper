import { GripVertical, Pencil, Settings as SettingsIcon } from "lucide-react";
import { useRef, useCallback } from "react";
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
import { MarqueeSelect } from "./display/marquee-select";
import { LocationSection } from "./sidebar/location-section";
import { RoadSection } from "./sidebar/road-section";
import { DetailsSection } from "./sidebar/details-section";
import { CoordsSection } from "./sidebar/coords-section";
import { EmptyState } from "./sidebar/empty-state";
import { GeocodeNotice } from "./sidebar/geocode-notice";
import { StatusDot } from "./sidebar/status-dot";
import { useDisplayStore, type WidgetId, SIDEBAR_MIN_WIDTH, SIDEBAR_MAX_WIDTH } from "@/lib/display-store";
import { clearMockIfPresent, injectMockIfEmpty } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import logoUrl from "@/assets/logo.png";

export function Sidebar() {
  const openSettings = useStore((s) => s.openSettings);
  const conn = useStore((s) => s.conn);
  const current = useStore((s) => s.current);

  const editing = useDisplayStore((s) => s.editing);
  const toggleEditing = useDisplayStore((s) => s.toggleEditing);
  const order = useDisplayStore((s) => s.order);
  const setOrder = useDisplayStore((s) => s.setOrder);
  const sidebarWidth = useDisplayStore((s) => s.sidebarWidth);
  const setSidebarWidth = useDisplayStore((s) => s.setSidebarWidth);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(0);
  const isDragging = useRef(false);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!editing) return;
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragStartWidth.current = sidebarWidth;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [editing, sidebarWidth]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const delta = e.clientX - dragStartX.current;
    const next = Math.max(SIDEBAR_MIN_WIDTH, Math.min(SIDEBAR_MAX_WIDTH, dragStartWidth.current + delta));
    setSidebarWidth(next);
  }, [setSidebarWidth]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }, []);

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
        "relative flex h-full shrink-0 flex-col bg-sidebar border-r border-sidebar-border",
        editing && "ring-1 ring-inset ring-brand/20",
      )}
      style={{ width: sidebarWidth }}
    >
      {editing && (
        <div
          className="absolute inset-y-0 right-0 z-50 flex w-4 cursor-col-resize items-center justify-center"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <div className="flex h-8 items-center rounded-full border border-sidebar-border bg-sidebar/90 px-0.5 shadow-sm backdrop-blur">
            <GripVertical className="size-3 text-muted-foreground" />
          </div>
        </div>
      )}
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
                variant="ghost"
                className={cn(
                  "size-8",
                  editing && "bg-brand/15 text-brand hover:bg-brand/20 hover:text-brand",
                )}
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
          <MarqueeSelect>
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
          </MarqueeSelect>
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
