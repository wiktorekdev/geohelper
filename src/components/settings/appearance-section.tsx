import { Moon, Palette, Sun } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { Field, Group } from "./settings-primitives";
import type { Theme } from "@/lib/store";
import { cn } from "@/lib/utils";

type Props = {
  theme: Theme;
  alwaysOnTop: boolean;
  setTheme: (theme: Theme) => void;
  setAlwaysOnTop: (value: boolean) => void;
};

export function AppearanceSection({
  theme,
  alwaysOnTop,
  setTheme,
  setAlwaysOnTop,
}: Props) {
  return (
    <Group icon={<Palette className="size-3.5" />} title="Appearance">
      <Field label="Theme">
        <div className="grid grid-cols-2 gap-2">
          <ThemeButton active={theme === "dark"} onClick={() => setTheme("dark")}>
            <Moon className="size-3.5" />
            Dark
          </ThemeButton>
          <ThemeButton active={theme === "light"} onClick={() => setTheme("light")}>
            <Sun className="size-3.5" />
            Light
          </ThemeButton>
        </div>
      </Field>

      <div className="flex items-center justify-between gap-2 pt-1 text-sm">
        <span>Always on top</span>
        <Switch
          checked={alwaysOnTop}
          onCheckedChange={setAlwaysOnTop}
          aria-label="Toggle always on top"
        />
      </div>
    </Group>
  );
}

function ThemeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-9 items-center justify-center gap-2 rounded-md border text-sm transition-colors",
        active
          ? "border-foreground/20 bg-accent text-foreground"
          : "border-border text-muted-foreground hover:bg-accent/60",
      )}
    >
      {children}
    </button>
  );
}
