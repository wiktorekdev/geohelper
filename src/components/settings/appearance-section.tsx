import { Palette } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { Field, Group } from "./settings-primitives";
import { LanguageSelector } from "./language-selector";
import { ThemeSelector } from "./theme-selector";
import { useT } from "@/lib/i18n";

type Props = {
  alwaysOnTop: boolean;
  setAlwaysOnTop: (value: boolean) => void;
};

export function AppearanceSection({ alwaysOnTop, setAlwaysOnTop }: Props) {
  const t = useT();
  return (
    <Group icon={<Palette className="size-3.5" />} title={t("settings.appearance.title")}>
      <Field label={t("settings.appearance.theme")}>
        <ThemeSelector />
      </Field>

      <Field label={t("settings.appearance.language")}>
        <LanguageSelector />
      </Field>

      <div className="flex items-center justify-between gap-2 pt-1 text-sm">
        <span>{t("settings.appearance.alwaysOnTop")}</span>
        <Switch
          checked={alwaysOnTop}
          onCheckedChange={setAlwaysOnTop}
          aria-label={t("settings.appearance.toggleAlwaysOnTop")}
        />
      </div>
    </Group>
  );
}
