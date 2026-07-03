import { GripVertical } from "lucide-react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import { cn } from "@/lib/utils"
import { useDisplayStore, widgetLabel, type WidgetId } from "@/lib/display-store"
import { useT } from "@/lib/i18n"

type Props = {
  id: WidgetId
  children: React.ReactNode
}

export function SortableSection({ id, children }: Props) {
  const t = useT()
  const editing = useDisplayStore((s) => s.editing)
  const selection = useDisplayStore((s) => s.selection)
  const selectWidget = useDisplayStore((s) => s.selectWidget)
  const registeredIds = useDisplayStore((s) => s.registeredIds)
  const hiddenTexts = useDisplayStore((s) => s.hiddenTexts)

  const sectionSelected = selection.length > 0 && selection.every((sid) => sid.startsWith(`${id}.`))

  // The section is "effectively hidden" when at least one text is registered
  // for it AND every registered text is in hiddenTexts.
  const sectionIds = Object.keys(registeredIds).filter((rid) => rid.startsWith(`${id}.`))
  const allHidden = sectionIds.length > 0 && sectionIds.every((rid) => hiddenTexts[rid])

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled: !editing,
  })

  const dragStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  if (!editing) {
    if (allHidden) return null
    return <>{children}</>
  }

  return (
    <div
      ref={setNodeRef}
      style={dragStyle}
      className={cn(
        "mx-3 my-1.5 overflow-hidden rounded-md border border-dashed transition-colors",
        isDragging
          ? "z-10 border-brand/60 bg-background/80 shadow-lg"
          : sectionSelected
            ? "border-brand/40 bg-brand/[0.03]"
            : "border-white/[0.08] bg-white/[0.01]",
        allHidden && "opacity-50"
      )}
    >
      <div
        data-no-marquee
        className="flex items-center gap-1 border-b border-white/[0.04] bg-white/[0.02] px-1.5 py-1"
      >
        <button
          {...attributes}
          {...listeners}
          className="inline-flex size-6 cursor-grab items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground active:cursor-grabbing touch-none"
          aria-label={t("section.dragToReorder")}
        >
          <GripVertical className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={(event) => selectWidget(id, event.shiftKey || event.ctrlKey || event.metaKey)}
          className={cn(
            "flex-1 truncate rounded px-1 py-0.5 text-left text-[9px] font-medium uppercase tracking-wider transition-colors",
            sectionSelected
              ? "text-brand"
              : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
          )}
          aria-label={t("section.selectAllIn", { widget: widgetLabel(id) })}
        >
          {widgetLabel(id)}
        </button>
      </div>

      <div>{children}</div>
    </div>
  )
}
