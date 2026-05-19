import { create } from "zustand";

import en from "@/locales/en.json";
import pl from "@/locales/pl.json";

export type Locale = "en" | "pl";

const BUNDLES: Partial<Record<Locale, Record<string, string>>> = {
  en: en as Record<string, string>,
  pl: pl as Record<string, string>,
};

export type LocaleMeta = { id: Locale; label: string; nativeLabel: string; countryCode: string };

export const SUPPORTED_LOCALES: LocaleMeta[] = [
  { id: "en", label: "English", nativeLabel: "English", countryCode: "GB" },
  { id: "pl", label: "Polish", nativeLabel: "Polski", countryCode: "PL" },
];

const SUPPORTED_IDS = new Set<Locale>(SUPPORTED_LOCALES.map((l) => l.id));
const DEFAULT_LOCALE: Locale = "en";
const STORAGE_KEY = "geohelper.locale";

function loadLocale(): Locale {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw && SUPPORTED_IDS.has(raw as Locale)) return raw as Locale;
  } catch {
    /* ignore */
  }
  return DEFAULT_LOCALE;
}

type I18nStore = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

export const useI18n = create<I18nStore>((set) => ({
  locale: loadLocale(),
  setLocale: (locale) => {
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      /* ignore */
    }
    set({ locale });
  },
}));

/**
 * Translate a key. Falls back to the English bundle, then to the key itself.
 * Variables: t("hello.user", { name: "Alice" }) replaces {name}.
 */
export function t(key: string, vars?: Record<string, string | number>): string {
  const locale = useI18n.getState().locale;
  const value = BUNDLES[locale]?.[key] ?? BUNDLES.en?.[key] ?? key;
  if (!vars) return value;
  return value.replace(/\{(\w+)\}/g, (_, name) =>
    name in vars ? String(vars[name]) : `{${name}}`,
  );
}

/** Hook variant — re-renders when the user switches locale. */
export function useT() {
  const locale = useI18n((s) => s.locale);
  return (key: string, vars?: Record<string, string | number>) => {
    const value = BUNDLES[locale]?.[key] ?? BUNDLES.en?.[key] ?? key;
    if (!vars) return value;
    return value.replace(/\{(\w+)\}/g, (_, name) =>
      name in vars ? String(vars[name]) : `{${name}}`,
    );
  };
}
