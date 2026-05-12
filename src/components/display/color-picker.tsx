import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Props = {
  value: string | null;
  onChange: (hex: string | null) => void;
};

export function ColorPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const displayColor = value ?? "var(--foreground)";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Pick color"
          className={cn(
            "size-6 shrink-0 rounded-md border border-sidebar-border shadow-sm",
            "ring-offset-background transition-all hover:scale-105",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          )}
          style={{ backgroundColor: displayColor }}
        />
      </PopoverTrigger>
      <PopoverContent
        side="left"
        align="start"
        sideOffset={8}
        className="w-auto p-3"
      >
        <div className="space-y-3">
          <HexColorPicker
            color={value ?? "#ffffff"}
            onChange={onChange}
            style={{ width: 180, height: 140 }}
          />
          <div className="flex items-center gap-2">
            <div
              className="size-5 rounded border border-sidebar-border"
              style={{ backgroundColor: value ?? "var(--foreground)" }}
            />
            <span className="font-mono text-[11px] text-muted-foreground flex-1">
              {value ?? "default"}
            </span>
            {value && (
              <button
                type="button"
                onClick={() => onChange(null)}
                className="text-[11px] text-muted-foreground hover:text-foreground"
              >
                reset
              </button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
