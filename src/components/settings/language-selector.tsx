import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import ReactCountryFlag from "react-country-flag";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SUPPORTED_LOCALES, useI18n, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";

export function LanguageSelector() {
  const locale = useI18n((s) => s.locale);
  const setLocale = useI18n((s) => s.setLocale);
  const [open, setOpen] = useState(false);

  const current = SUPPORTED_LOCALES.find((l) => l.id === locale) ?? SUPPORTED_LOCALES[0];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "inline-flex h-9 w-full items-center justify-between gap-2 rounded-md",
            "border border-input bg-background px-3 text-xs",
            "transition-colors hover:bg-accent/40",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
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
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-[var(--radix-popover-trigger-width)] p-0"
      >
        <Command>
          <CommandInput placeholder={t("settings.appearance.languageSearch")} />
          <CommandList>
            <CommandEmpty>{t("settings.appearance.languageEmpty")}</CommandEmpty>
            <CommandGroup>
              {SUPPORTED_LOCALES.map((l) => (
                <CommandItem
                  key={l.id}
                  value={`${l.label} ${l.nativeLabel} ${l.id}`}
                  onSelect={() => {
                    setLocale(l.id as Locale);
                    setOpen(false);
                  }}
                >
                  <ReactCountryFlag
                    countryCode={l.countryCode}
                    svg
                    style={{ width: 18, height: 13, borderRadius: 2, flexShrink: 0 }}
                  />
                  <span className="truncate">{l.nativeLabel}</span>
                  <Check
                    className={cn(
                      "ml-auto size-3.5",
                      locale === l.id ? "opacity-100 text-brand" : "opacity-0",
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
