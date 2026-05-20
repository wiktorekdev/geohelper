import { m, AnimatePresence } from "framer-motion";
import { Bold, Eye, EyeOff, RotateCcw, Type, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  ColorPicker,
  ColorPickerSelection,
  ColorPickerHue,
} from "@/components/ui/color-picker";
import {
  DEFAULT_TEXT_STYLE,
  useDisplayStore,
  type FontSize,
} from "@/lib/display-store";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";

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

  const visible = editing && selection.length > 0;

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
    <AnimatePresence>
      {visible && (
        <m.div
          data-no-marquee
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
          className="pointer-events-none fixed inset-x-0 z-[2100] flex justify-center px-2 transition-[bottom,left] duration-500"
          style={{ left: mapVisible ? sidebarWidth : 0, bottom: mapVisible ? 64 : 116 }}
        >
          <div className="pointer-events-auto flex items-center gap-1 rounded-xl border border-sidebar-border bg-sidebar/95 px-2 py-1.5 shadow-lg backdrop-blur">
        <div className="inline-flex items-center gap-1.5 px-1.5 text-[12px] font-medium">
          <Type className="size-3.5 text-brand" />
          <span className="tabular-nums">
            {selection.length} {selection.length === 1 ? t("selection.text") : t("selection.texts")}
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
                aria-label={t("selection.bold")}
              >
                <Bold className="size-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">{t("selection.bold")}</TooltipContent>
          </Tooltip>
        )}

        {showColor && (
          <ColorPickerButton
            value={summary.color}
            onChange={(color: string | null) => setSelectionStyle({ color })}
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
              aria-label={allHidden ? t("selection.show") : t("selection.hide")}
            >
              {allHidden ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">{allHidden ? t("selection.showSelected") : t("selection.hideSelected")}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={resetSelection}
              className="inline-flex size-7 items-center justify-center rounded-md border border-sidebar-border bg-background/50 text-muted-foreground transition-colors hover:text-foreground"
              aria-label={t("selection.reset")}
            >
              <RotateCcw className="size-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">{t("selection.resetSelected")}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={clearSelection}
              className="inline-flex size-7 items-center justify-center rounded-md border border-sidebar-border bg-background/50 text-muted-foreground transition-colors hover:text-foreground"
              aria-label={t("selection.deselect")}
            >
              <X className="size-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">{t("selection.deselect")}</TooltipContent>
        </Tooltip>
          </div>
        </m.div>
      )}
    </AnimatePresence>
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

function parseColorInput(raw: string): string | null {
  const s = raw.trim();
  const hex = s.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const h = hex[1];
    return h.length === 3
      ? "#" + h[0]+h[0]+h[1]+h[1]+h[2]+h[2]
      : "#" + h;
  }
  const rgb = s.match(/^(?:rgb\s*\(\s*)?(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)?$/);
  if (rgb) {
    const [r, g, b] = [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
    if (r <= 255 && g <= 255 && b <= 255) {
      return "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("");
    }
  }
  return null;
}

function ColorPickerButton({ value, onChange }: { value: string | null; onChange: (color: string | null) => void }) {
  const [open, setOpen] = useState(false);
  const [inputVal, setInputVal] = useState(value ?? "");
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    if (!open) setInputVal(value ?? "");
  }, [value, open]);

  const handleChange = useCallback((color: unknown) => {
    if (Array.isArray(color)) {
      const hex = "#" + color.slice(0, 3).map((c: number) => Math.round(c).toString(16).padStart(2, "0")).join("");
      onChange(hex);
      setInputVal(hex);
      setInvalid(false);
    }
  }, [onChange]);

  function commitInput(raw: string) {
    const parsed = parseColorInput(raw);
    if (parsed) {
      onChange(parsed);
      setInputVal(parsed);
      setInvalid(false);
    } else {
      setInvalid(true);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative size-7 shrink-0 overflow-hidden rounded-md border border-sidebar-border shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          style={{ backgroundColor: value ?? "#ffffff" }}
        />
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        sideOffset={10}
        collisionPadding={12}
        avoidCollisions
        className="z-[2200] w-64 p-4 border border-sidebar-border bg-popover rounded-lg shadow-2xl"
      >
        <ColorPicker
          value={value ?? "#ffffff"}
          onChange={handleChange}
          className="flex flex-col gap-3"
        >
          <ColorPickerSelection className="h-32 rounded-lg" />
          <ColorPickerHue />
        </ColorPicker>
        <div className="mt-2 flex items-center gap-2 border-t border-sidebar-border pt-2">
          <div
            className="size-5 shrink-0 rounded border border-sidebar-border"
            style={{ backgroundColor: value ?? "#ffffff" }}
          />
          <input
            className={cn(
              "h-7 flex-1 rounded-md border px-2 text-[11px] font-mono bg-background outline-none transition-colors",
              invalid ? "border-red-500 text-red-500" : "border-sidebar-border focus:border-ring",
            )}
            value={inputVal}
            placeholder="#rrggbb or r, g, b"
            onChange={(e) => { setInputVal(e.target.value); setInvalid(false); }}
            onBlur={(e) => commitInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") commitInput(inputVal); }}
            onPaste={(e) => {
              const pasted = e.clipboardData.getData("text");
              setTimeout(() => commitInput(pasted), 0);
            }}
          />
          {value && (
            <button
              type="button"
              onClick={() => { onChange(null); setInputVal(""); setInvalid(false); }}
              className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
              title="Reset"
            >
              <RotateCcw className="size-3.5" />
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
