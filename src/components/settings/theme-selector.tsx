import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Palette } from "lucide-react";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useThemeStore } from "@/lib/themes/store";
import { BUILTIN_THEMES } from "@/lib/themes/builtin";
import type { Theme } from "@/lib/themes/types";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";

export function ThemeSelector() {
  const activeId = useThemeStore((s) => s.activeId);
  const setActive = useThemeStore((s) => s.setActive);
  const userThemes = useThemeStore((s) => s.userThemes);
  const [open, setOpen] = useState(false);

  const themes = useMemo<Theme[]>(
    () => [...BUILTIN_THEMES, ...userThemes],
    [userThemes],
  );

  const current = themes.find((th) => th.id === activeId) ?? themes[0];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "inline-flex h-9 w-full items-center justify-between gap-2 rounded-md",
            "border border-input bg-background px-2.5 text-xs",
            "transition-colors hover:bg-accent/40",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          )}
        >
          <span className="inline-flex min-w-0 items-center gap-2">
            <ThemeSwatch theme={current} />
            <span className="truncate">{current.name}</span>
            {!current.builtin && (
              <span className="rounded-sm bg-accent px-1 text-[9px] uppercase tracking-wide text-muted-foreground">
                {t("settings.appearance.themeCustom")}
              </span>
            )}
          </span>
          <ChevronsUpDown className="size-3.5 shrink-0 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-[var(--radix-popover-trigger-width)] p-0"
      >
        <Command>
          <CommandInput placeholder={t("settings.appearance.themeSearch")} />
          <CommandList>
            <CommandEmpty>{t("settings.appearance.themeEmpty")}</CommandEmpty>
            <CommandGroup>
              {themes.map((th) => (
                <CommandItem
                  key={th.id}
                  value={`${th.name} ${th.id}`}
                  onSelect={() => {
                    setActive(th.id);
                    setOpen(false);
                  }}
                  className="gap-2"
                >
                  <ThemeSwatch theme={th} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs">{th.name}</div>
                    {th.description && (
                      <div className="truncate text-[10px] text-muted-foreground">
                        {th.description}
                      </div>
                    )}
                  </div>
                  <Check
                    className={cn(
                      "size-3.5 shrink-0",
                      activeId === th.id ? "opacity-100 text-brand" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function ThemeSwatch({ theme }: { theme: Theme }) {
  const bg = theme.vars?.background ?? (theme.mode === "dark" ? "oklch(0.18 0 0)" : "oklch(0.98 0 0)");
  const fg = theme.vars?.foreground ?? (theme.mode === "dark" ? "oklch(0.96 0 0)" : "oklch(0.145 0 0)");

  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md",
        "border border-sidebar-border shadow-inner",
      )}
      style={{ background: bg, color: fg }}
    >
      <ThemeIcon theme={theme} />
    </span>
  );
}

function ThemeIcon({ theme }: { theme: Theme }) {
  if (theme.iconUrl) {
    return (
      <img
        src={theme.iconUrl}
        alt=""
        className="size-4 object-contain"
        draggable={false}
      />
    );
  }

  if (theme.icon) {
    const Icon = (LucideIcons as unknown as Record<string, LucideIcon | undefined>)[theme.icon];
    if (Icon) return <Icon className="size-3.5" strokeWidth={2} />;
  }

  if (theme.emoji) {
    return <span className="text-[12px] leading-none">{theme.emoji}</span>;
  }

  return <Palette className="size-3.5 opacity-70" strokeWidth={2} />;
}
