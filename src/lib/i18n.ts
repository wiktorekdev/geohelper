import { create } from "zustand";

import en from "@/locales/en.json";
import pl from "@/locales/pl.json";
import { getSettingsStore, saveSetting } from "./settings-persistence";

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

type I18nStore = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  hydrate: () => Promise<void>;
};

export const useI18n = create<I18nStore>((set) => ({
  locale: DEFAULT_LOCALE,
  setLocale: (locale) => {
    void saveSetting("locale", locale);
    set({ locale });
  },
  hydrate: async () => {
    try {
      const store = await getSettingsStore();
      const stored = await store.get<Locale>("locale");
      if (stored && SUPPORTED_IDS.has(stored)) {
        set({ locale: stored });
      }
    } catch {
      /* ignore */
    }
  },
}));

function translate(locale: Locale, key: string, vars?: Record<string, string | number>): string {
  const value = BUNDLES[locale]?.[key] ?? BUNDLES.en?.[key] ?? key;
  if (!vars) return value;
  return value.replace(/\{(\w+)\}/g, (_, name) =>
    name in vars ? String(vars[name]) : `{${name}}`,
  );
}

/**
 * Translate a key. Falls back to the English bundle, then to the key itself.
 * Variables: t("hello.user", { name: "Alice" }) replaces {name}.
 */
export function t(key: string, vars?: Record<string, string | number>): string {
  const locale = useI18n.getState().locale;
  return translate(locale, key, vars);
}

/** Hook variant — re-renders when the user switches locale. */
export function useT() {
  const locale = useI18n((s) => s.locale);
  return (key: string, vars?: Record<string, string | number>) => {
    return translate(locale, key, vars);
  };
}
