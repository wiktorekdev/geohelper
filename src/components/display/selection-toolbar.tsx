import { Bold, Eye, EyeOff, RotateCcw, Type, X } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DEFAULT_TEXT_STYLE,
  useDisplayStore,
  type FontSize,
} from "@/lib/display-store";
import { cn } from "@/lib/utils";
import { ColorPicker } from "./color-picker";

const FONT_SIZES: { id: FontSize; label: string }[] = [
  { id: "sm", label: "S" },
  { id: "md", label: "M" },
  { id: "lg", label: "L" },
];

export function SelectionToolbar() {
  const editing = useDisplayStore((s) => s.editing);
  const selection = useDisplayStore((s) => s.selection);
  const textStyles = useDisplayStore((s) => s.textStyles);
  const hiddenTexts = useDisplayStore((s) => s.hiddenTexts);
  const mapVisible = useDisplayStore((s) => s.mapVisible);
  const setSelectionStyle = useDisplayStore((s) => s.setSelectionStyle);
  const setSelectionHidden = useDisplayStore((s) => s.setSelectionHidden);
  const resetSelection = useDisplayStore((s) => s.resetSelection);
  const clearSelection = useDisplayStore((s) => s.clearSelection);
  const sidebarWidth = useDisplayStore((s) => s.sidebarWidth);

  if (!editing || selection.length === 0) return null;

  const summary = summarize(
    selection.map((id) => textStyles[id] ?? DEFAULT_TEXT_STYLE),
  );

  const allHidden = selection.every((id) => hiddenTexts[id] === true);

  // Capability flags vary by element kind. Flags only support size; everything else
  // supports the full set. Mixed selection = union of capabilities.
  const kinds = selection.map(kindForId);
  const onlyFlag = kinds.every((k) => k === "flag");
  const showBold = !onlyFlag;
  const showColor = !onlyFlag;

  return (
    <div
      data-no-marquee
      className="pointer-events-none fixed inset-x-0 z-[2100] flex justify-center px-2 transition-[bottom,left] duration-300"
      style={{ left: mapVisible ? sidebarWidth : 0, bottom: mapVisible ? 64 : 116 }}
    >
      <div className="pointer-events-auto flex items-center gap-1 rounded-xl border border-sidebar-border bg-sidebar/95 px-2 py-1.5 shadow-lg backdrop-blur">
        <div className="inline-flex items-center gap-1.5 px-1.5 text-[12px] font-medium">
          <Type className="size-3.5 text-brand" />
          <span className="tabular-nums">
            {selection.length} {selection.length === 1 ? "text" : "texts"}
          </span>
        </div>

        <Divider />

        <div className="inline-flex h-7 items-center gap-0.5 rounded-md border border-sidebar-border bg-background/50 p-0.5">
          {FONT_SIZES.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectionStyle({ fontSize: f.id })}
              className={cn(
                "h-6 w-7 rounded text-[11px] font-medium transition-colors",
                summary.fontSize === f.id
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {showBold && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setSelectionStyle({ bold: !summary.bold })}
                className={cn(
                  "inline-flex size-7 items-center justify-center rounded-md border border-sidebar-border transition-colors",
                  summary.bold
                    ? "bg-accent text-foreground"
                    : "bg-background/50 text-muted-foreground hover:text-foreground",
                )}
                aria-pressed={summary.bold}
                aria-label="Bold"
              >
                <Bold className="size-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">Bold</TooltipContent>
          </Tooltip>
        )}

        {showColor && (
          <ColorPicker
            value={summary.color}
            onChange={(color) => setSelectionStyle({ color })}
          />
        )}

        <Divider />

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setSelectionHidden(!allHidden)}
              className={cn(
                "inline-flex size-7 items-center justify-center rounded-md border border-sidebar-border transition-colors",
                allHidden
                  ? "bg-accent text-foreground"
                  : "bg-background/50 text-muted-foreground hover:text-foreground",
              )}
              aria-pressed={allHidden}
              aria-label={allHidden ? "Show" : "Hide"}
            >
              {allHidden ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">{allHidden ? "Show selected" : "Hide selected"}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={resetSelection}
              className="inline-flex size-7 items-center justify-center rounded-md border border-sidebar-border bg-background/50 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Reset"
            >
              <RotateCcw className="size-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">Reset selected</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={clearSelection}
              className="inline-flex size-7 items-center justify-center rounded-md border border-sidebar-border bg-background/50 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Deselect"
            >
              <X className="size-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">Deselect</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

function Divider() {
  return <span className="mx-0.5 h-5 w-px bg-sidebar-border" />;
}

function kindForId(id: string): "flag" | "text" {
  if (id === "country.flag") return "flag";
  return "text";
}

function summarize(styles: { color: string | null; bold: boolean; fontSize: FontSize }[]): {
  color: string | null;
  bold: boolean;
  fontSize: FontSize | undefined;
} {
  if (styles.length === 0) {
    return { color: null, bold: false, fontSize: undefined };
  }
  const first = styles[0];
  const sameColor = styles.every((s) => s.color === first.color);
  const sameBold = styles.every((s) => s.bold === first.bold);
  const sameSize = styles.every((s) => s.fontSize === first.fontSize);
  return {
    color: sameColor ? first.color : null,
    bold: sameBold ? first.bold : false,
    fontSize: sameSize ? first.fontSize : undefined,
  };
}
