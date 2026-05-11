import { useEffect } from "react";
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
import { useDisplayStore, type WidgetId } from "@/lib/display-store";
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

  // Inject mock data when entering edit mode if nothing real is available yet,
  // and clear it when leaving.
  useEffect(() => {
    if (editing) injectMockIfEmpty();
    else clearMockIfPresent();
  }, [editing]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

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
        "flex h-full w-[320px] shrink-0 flex-col bg-sidebar border-r border-sidebar-border",
        editing && "ring-1 ring-inset ring-brand/20",
      )}
    >
      <header className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <img src={logoUrl} alt="" className="h-8 w-8 shrink-0" />
          <div className="text-[15px] font-semibold tracking-tight">GeoHelper</div>
        </div>
        <div className="flex items-center gap-1">
          <StatusDot conn={conn} />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant={editing ? "default" : "ghost"}
                className="h-8 w-8"
                onClick={toggleEditing}
                aria-pressed={editing}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {editing ? "Finish editing" : "Edit layout"}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={openSettings}>
                <SettingsIcon className="h-4 w-4" />
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

function StatusDot({ conn }: { conn: ReturnType<typeof useStore.getState>["conn"] }) {
  const { tone, title } = describe(conn);
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            "mr-1 inline-block h-1.5 w-1.5 rounded-full",
            tone === "ok" && "bg-emerald-500",
            tone === "warn" && "bg-amber-500 animate-pulse",
            tone === "bad" && "bg-rose-500",
          )}
        />
      </TooltipTrigger>
      <TooltipContent side="bottom">{title}</TooltipContent>
    </Tooltip>
  );
}

function describe(conn: ReturnType<typeof useStore.getState>["conn"]) {
  switch (conn.kind) {
    case "connected":
      return { tone: "ok" as const, title: "Connected to GeoGuessr" };
    case "searching":
      return { tone: "warn" as const, title: "Looking for GeoGuessr..." };
    case "disconnected":
      return { tone: "bad" as const, title: `Disconnected: ${conn.reason}` };
    default:
      return { tone: "warn" as const, title: "Idle" };
  }
}

function EmptyState({ conn }: { conn: ReturnType<typeof useStore.getState>["conn"] }) {
  if (conn.kind === "connected") {
    return (
      <div className="flex-1 flex items-center justify-center py-16 text-xs text-muted-foreground">
        Waiting for a round...
      </div>
    );
  }

  return (
    <div className="px-5 py-10 space-y-3 text-center">
      <div className="text-sm text-muted-foreground">Not connected</div>
      <div className="mx-auto max-w-[260px] rounded-md border border-sidebar-border bg-background/50 p-3 text-left text-[11px] text-muted-foreground leading-relaxed">
        Make sure GeoGuessr is launched with:
        <code className="mt-1.5 block rounded bg-accent px-2 py-1 font-mono text-[10px] break-all">
          --remote-debugging-port=9222 --remote-allow-origins=*
        </code>
      </div>
    </div>
  );
}

function GeocodeNotice() {
  const error = useStore((s) => s.geocodeError);
  if (!error) return null;
  return (
    <div className="mx-4 mb-3 rounded-md border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-300">
      Location lookup failed: {error}
    </div>
  );
}
