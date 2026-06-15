import { useState } from "react"
import { Check, ChevronsUpDown, Palette } from "lucide-react"
import * as LucideIcons from "lucide-react"
import type { LucideIcon } from "lucide-react"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useThemeStore } from "@/lib/themes/store"
import { BUILTIN_THEMES } from "@/lib/themes/builtin"
import type { Theme } from "@/lib/themes/types"
import { cn } from "@/lib/utils"
import { useT } from "@/lib/i18n"

export function ThemeSelector() {
  const t = useT()
  const activeId = useThemeStore((s) => s.activeId)
  const setActive = useThemeStore((s) => s.setActive)
  const [open, setOpen] = useState(false)

  const current = BUILTIN_THEMES.find((theme) => theme.id === activeId) ?? BUILTIN_THEMES[0]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-controls="theme-listbox"
          className={cn(
            "inline-flex h-9 w-full items-center justify-between gap-2 rounded-md",
            "border border-input bg-background px-3 text-xs",
            "transition-colors hover:bg-accent/40",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          )}
        >
          <span className="inline-flex min-w-0 items-center gap-2">
            <ThemeSwatch theme={current} />
            <span className="truncate">{current.name}</span>
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
          <CommandList id="theme-listbox">
            <CommandEmpty>{t("settings.appearance.themeEmpty")}</CommandEmpty>
            <CommandGroup>
              {BUILTIN_THEMES.map((theme) => (
                <CommandItem
                  key={theme.id}
                  value={`${theme.name} ${theme.id}`}
                  onSelect={() => {
                    setActive(theme.id)
                    setOpen(false)
                  }}
                  className="gap-2"
                >
                  <ThemeSwatch theme={theme} />
                  <span className="truncate text-xs min-w-0 flex-1">{theme.name}</span>
                  <Check
                    className={cn(
                      "ml-auto size-3.5 shrink-0",
                      activeId === theme.id ? "opacity-100 text-brand" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

function ThemeSwatch({ theme }: { theme: Theme }) {
  const bg = theme.mode === "dark" ? "oklch(0.18 0 0)" : "oklch(0.98 0 0)"
  const fg = theme.mode === "dark" ? "oklch(0.96 0 0)" : "oklch(0.145 0 0)"

  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-md",
        "border border-sidebar-border shadow-inner"
      )}
      style={{ background: bg, color: fg }}
    >
      <ThemeIcon theme={theme} />
    </span>
  )
}

function ThemeIcon({ theme }: { theme: Theme }) {
  if (theme.icon) {
    const Icon = (LucideIcons as unknown as Record<string, LucideIcon | undefined>)[theme.icon]
    if (Icon) return <Icon className="size-3" strokeWidth={2} />
  }

  return <Palette className="size-3 opacity-70" strokeWidth={2} />
}
