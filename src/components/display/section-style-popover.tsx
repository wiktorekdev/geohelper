import { Eye, EyeOff, RotateCcw, Settings2 } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  useDisplayStore,
  WIDGET_LABELS,
  type FontSize,
  type WidgetId,
} from "@/lib/display-store";
import { ColorPicker } from "./color-picker";

type Props = {
  id: WidgetId;
};

const FONT_SIZES: { id: FontSize; label: string }[] = [
  { id: "sm", label: "S" },
  { id: "md", label: "M" },
  { id: "lg", label: "L" },
];

export function SectionStylePopover({ id }: Props) {
  const style = useDisplayStore((s) => s.styles[id]);
  const visible = useDisplayStore((s) => s.visibility[id]);
  const setStyle = useDisplayStore((s) => s.setStyle);
  const setVisibility = useDisplayStore((s) => s.setVisibility);
  const resetWidget = useDisplayStore((s) => s.resetWidget);

  const label = WIDGET_LABELS[id];

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label={`Edit ${label}`}
              className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-sidebar-border bg-background/60 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Settings2 className="h-3 w-3" />
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="top">Style {label.toLowerCase()}</TooltipContent>
      </Tooltip>

      <PopoverContent side="left" align="start" sideOffset={10} className="w-64 p-3">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-semibold tracking-wide uppercase text-muted-foreground">
              {label}
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => resetWidget(id)}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                  aria-label="Reset"
                >
                  <RotateCcw className="h-3 w-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">Reset this section</TooltipContent>
            </Tooltip>
          </div>

          <Separator />

          <Row label={visible ? "Visible" : "Hidden"} icon={visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}>
            <Switch
              checked={visible}
              onCheckedChange={(v) => setVisibility(id, v)}
              aria-label="Toggle visibility"
            />
          </Row>

          <Row label="Size">
            <div className="inline-flex h-7 items-center gap-0.5 rounded-md border border-sidebar-border bg-background/50 p-0.5">
              {FONT_SIZES.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setStyle(id, { fontSize: f.id })}
                  className={cn(
                    "h-6 w-7 rounded text-[11px] font-medium transition-colors",
                    style.fontSize === f.id
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </Row>

          <Row label="Bold">
            <Switch
              checked={style.bold}
              onCheckedChange={(v) => setStyle(id, { bold: v })}
              aria-label="Toggle bold"
            />
          </Row>

          <Row label="Color">
            <ColorPicker
              value={style.color}
              onChange={(color) => setStyle(id, { color })}
            />
          </Row>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function Row({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
        {icon}
        {label}
      </span>
      {children}
    </div>
  );
}
