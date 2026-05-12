import { GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { cn } from "@/lib/utils";
import {
  FONT_SIZE_PX,
  useDisplayStore,
  WIDGET_LABELS,
  type WidgetId,
} from "@/lib/display-store";
import { SectionStylePopover } from "./section-style-popover";

type Props = {
  id: WidgetId;
  children: React.ReactNode;
};

export function SortableSection({ id, children }: Props) {
  const editing = useDisplayStore((s) => s.editing);
  const visible = useDisplayStore((s) => s.visibility[id]);
  const style = useDisplayStore((s) => s.styles[id]);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled: !editing,
  });

  const dragStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const contentStyle: React.CSSProperties = {
    color: style.color ?? undefined,
    fontWeight: style.bold ? 600 : undefined,
    fontSize: FONT_SIZE_PX[style.fontSize],
  };

  if (!editing) {
    if (!visible) return null;
    return <div style={contentStyle}>{children}</div>;
  }

  return (
    <div
      ref={setNodeRef}
      style={dragStyle}
      className={cn(
        "mx-3 my-1.5 overflow-hidden rounded-md border border-dashed transition-colors",
        isDragging
          ? "z-10 border-brand/60 bg-background/80 shadow-lg"
          : "border-sidebar-border/70 bg-background/30",
        !visible && "opacity-60",
      )}
    >
      <div className="flex items-center gap-1 border-b border-sidebar-border/50 bg-background/40 px-1.5 py-1">
        <button
          {...attributes}
          {...listeners}
          className="inline-flex size-6 cursor-grab items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground active:cursor-grabbing touch-none"
          aria-label="Drag to reorder"
        >
          <GripVertical className="size-3.5" />
        </button>
        <span className="flex-1 truncate text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {WIDGET_LABELS[id]}
        </span>
        <SectionStylePopover id={id} />
      </div>

      <div style={contentStyle}>{children}</div>
    </div>
  );
}
