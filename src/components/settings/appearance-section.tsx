import { Palette } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Field, Group, ThemeButton } from "./settings-primitives";
import type { CopyFormat, Theme } from "@/lib/store";

type Props = {
  theme: Theme;
  alwaysOnTop: boolean;
  copyFormat: CopyFormat;
  setTheme: (theme: Theme) => void;
  setAlwaysOnTop: (value: boolean) => void;
  setCopyFormat: (format: CopyFormat) => void;
};

export function AppearanceSection({
  theme,
  alwaysOnTop,
  copyFormat,
  setTheme,
  setAlwaysOnTop,
  setCopyFormat,
}: Props) {
  return (
    <Group icon={<Palette className="size-3.5" />} title="Appearance">
      <Field label="Theme">
        <div className="grid grid-cols-2 gap-2">
          <ThemeButton active={theme === "dark"} onClick={() => setTheme("dark")}>
            Dark
          </ThemeButton>
          <ThemeButton active={theme === "light"} onClick={() => setTheme("light")}>
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

      <Field label="Copy format">
        <Select value={copyFormat} onValueChange={(value) => setCopyFormat(value as CopyFormat)}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lat, lng">lat, lng</SelectItem>
            <SelectItem value="lat,lng">lat,lng</SelectItem>
            <SelectItem value="lng,lat">lng,lat</SelectItem>
          </SelectContent>
        </Select>
      </Field>
    </Group>
  );
}
