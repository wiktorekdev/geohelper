import { Map, MapPinOff, Pencil, Settings as SettingsIcon, Bell } from "lucide-react"
import { useRef, useCallback } from "react"
import { m, AnimatePresence } from "motion/react"
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { SocialFooter } from "./social-footer"
import { UpdateBanner } from "./update-banner"
import { ChangelogModal } from "./changelog-modal"
import { SortableSection } from "./display/sortable-section"
import { MarqueeSelect } from "./display/marquee-select"
import { LocationSection } from "./sidebar/location-section"
import { RoadSection } from "./sidebar/road-section"
import { DetailsSection } from "./sidebar/details-section"
import { CoordsSection } from "./sidebar/coords-section"
import { EmptyState } from "./sidebar/empty-state"
import { GeocodeNotice } from "./sidebar/geocode-notice"
import { StatusDot } from "./sidebar/status-dot"
import { useWhatsNewStore } from "@/lib/whats-new-store"
import {
  useDisplayStore,
  type WidgetId,
  SIDEBAR_MIN_WIDTH,
  SIDEBAR_MAX_WIDTH,
} from "@/lib/display-store"
import { clearMockIfPresent, injectMockIfEmpty } from "@/lib/mock-data"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { useT } from "@/lib/i18n"
import logoUrl from "@/assets/logo.png"

export function Sidebar() {
  const t = useT()
  const openSettings = useStore((s) => s.openSettings)
  const openChangelog = useStore((s) => s.openChangelog)
  const hasUnreadChangelog = useWhatsNewStore((s) => s.hasUnread)
  const conn = useStore((s) => s.conn)
  const current = useStore((s) => s.current)

  const editing = useDisplayStore((s) => s.editing)
  const resizing = useDisplayStore((s) => s.resizing)
  const setResizing = useDisplayStore((s) => s.setResizing)
  const toggleEditing = useDisplayStore((s) => s.toggleEditing)
  const order = useDisplayStore((s) => s.order)
  const setOrder = useDisplayStore((s) => s.setOrder)
  const sidebarWidth = useDisplayStore((s) => s.sidebarWidth)
  const setSidebarWidth = useDisplayStore((s) => s.setSidebarWidth)
  const mapVisible = useDisplayStore((s) => s.mapVisible)
  const setMapVisible = useDisplayStore((s) => s.setMapVisible)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  const dragStartX = useRef(0)
  const dragStartWidth = useRef(0)

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!editing) return
      setResizing(true)
      dragStartX.current = e.clientX
      dragStartWidth.current = sidebarWidth
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    },
    [editing, setResizing, sidebarWidth]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!resizing) return
      const delta = e.clientX - dragStartX.current
      const next = Math.max(
        SIDEBAR_MIN_WIDTH,
        Math.min(SIDEBAR_MAX_WIDTH, dragStartWidth.current + delta)
      )
      setSidebarWidth(next)
    },
    [resizing, setSidebarWidth]
  )

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!resizing) return
      setResizing(false)
      ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
    },
    [resizing, setResizing]
  )

  function handleToggleEditing() {
    if (editing) clearMockIfPresent()
    else injectMockIfEmpty()
    toggleEditing()
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const from = order.indexOf(active.id as WidgetId)
    const to = order.indexOf(over.id as WidgetId)
    if (from === -1 || to === -1) return
    setOrder(arrayMove(order, from, to))
  }

  return (
    <aside
      className={cn(
        "relative flex h-full flex-col overflow-hidden bg-sidebar border-r border-sidebar-border",
        editing && "ring-1 ring-inset ring-brand/10",
        mapVisible ? "shrink-0" : "flex-1"
      )}
      style={{ width: mapVisible ? sidebarWidth : undefined }}
    >
      {editing && mapVisible && (
        <div
          className={cn(
            "absolute inset-y-0 right-[-3px] z-50 w-2 cursor-col-resize transition-colors",
            resizing ? "bg-brand/30" : "bg-transparent hover:bg-brand/20"
          )}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          aria-label="Resize sidebar"
        />
      )}
      <header className="flex items-center justify-between border-b border-white/[0.04] px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <img src={logoUrl} alt="" className="size-7 shrink-0 opacity-90" />
          <div className="text-[15px] font-semibold tracking-tight">{t("app.name")}</div>
        </div>
        <div className="flex items-center gap-1">
          <StatusDot conn={conn} />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="size-7"
                onClick={() => setMapVisible(!mapVisible)}
                aria-pressed={mapVisible}
              >
                {mapVisible ? <Map className="size-4" /> : <MapPinOff className="size-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {mapVisible ? t("toolbar.hideMap") : t("toolbar.showMap")}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className={cn(
                  "size-7",
                  editing && "bg-brand/10 text-brand hover:bg-brand/15 hover:text-brand"
                )}
                onClick={handleToggleEditing}
                aria-pressed={editing}
              >
                <Pencil className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {editing ? t("sidebar.finishEditing") : t("sidebar.editLayout")}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="relative size-7"
                onClick={openChangelog}
              >
                <Bell className="size-4" />
                {hasUnreadChangelog && (
                  <span className="absolute top-1 right-1 size-1.5 rounded-full bg-brand"></span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{t("update.whatsNew")}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" className="size-7" onClick={openSettings}>
                <SettingsIcon className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{t("sidebar.settings")}</TooltipContent>
          </Tooltip>
        </div>
      </header>

      <ScrollArea className="flex-1 min-h-0">
        <AnimatePresence mode="wait">
          {current || editing ? (
            <m.div
              key="widgets-container"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
            >
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
            </m.div>
          ) : (
            <EmptyState key="empty-state" conn={conn} />
          )}
        </AnimatePresence>
      </ScrollArea>

      <div className="shrink-0 flex flex-col">
        <ChangelogModal />
        <UpdateBanner />
        <SocialFooter />
      </div>
    </aside>
  )
}

function WidgetContent({ id }: { id: WidgetId }) {
  switch (id) {
    case "country":
      return <LocationSection />
    case "road":
      return <RoadSection />
    case "details":
      return <DetailsSection />
    case "coordinates":
      return <CoordsSection />
  }
}
