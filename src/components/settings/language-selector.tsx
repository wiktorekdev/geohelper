import { useMemo, useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import ReactCountryFlag from "react-country-flag"

import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SUPPORTED_LOCALES, useI18n, useT, type Locale } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export function LanguageSelector() {
  const t = useT()
  const locale = useI18n((s) => s.locale)
  const setLocale = useI18n((s) => s.setLocale)
  const [open, setOpen] = useState(false)

  const current = SUPPORTED_LOCALES.find((l) => l.id === locale) ?? SUPPORTED_LOCALES[0]

  const items = useMemo(
    () =>
      SUPPORTED_LOCALES.map((l) => ({
        value: `${l.label} ${l.nativeLabel} ${l.id}`,
        locale: l,
      })),
    []
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            role="combobox"
            aria-expanded={open}
            aria-controls="language-listbox"
            className={cn(
              "inline-flex h-9 w-full items-center justify-between gap-2 rounded-md",
              "border border-input bg-background px-3 text-xs",
              "transition-colors hover:bg-accent/40",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
          >
            <span className="inline-flex min-w-0 items-center gap-2">
              <ReactCountryFlag
                countryCode={current.countryCode}
                svg
                style={{ width: 18, height: 13, borderRadius: 2, flexShrink: 0 }}
              />
              <span className="truncate">{current.nativeLabel}</span>
            </span>
            <ChevronsUpDown className="size-3.5 shrink-0 opacity-60" />
          </button>
        }
      />
      <PopoverContent align="start" sideOffset={6} className="w-[var(--anchor-width)] p-0">
        <Command items={items}>
          <CommandInput placeholder={t("settings.appearance.languageSearch")} />
          <CommandEmpty>{t("settings.appearance.languageEmpty")}</CommandEmpty>
          <CommandList id="language-listbox">
            {(item: { value: string; locale: (typeof SUPPORTED_LOCALES)[number] }) => (
              <CommandItem
                key={item.locale.id}
                value={item.value}
                onClick={() => {
                  setLocale(item.locale.id as Locale)
                  setOpen(false)
                }}
              >
                <ReactCountryFlag
                  countryCode={item.locale.countryCode}
                  svg
                  style={{ width: 18, height: 13, borderRadius: 2, flexShrink: 0 }}
                />
                <span className="truncate">{item.locale.nativeLabel}</span>
                <Check
                  className={cn(
                    "ml-auto size-3.5",
                    locale === item.locale.id ? "opacity-100 text-brand" : "opacity-0"
                  )}
                />
              </CommandItem>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
