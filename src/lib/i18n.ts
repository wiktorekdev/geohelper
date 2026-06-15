import { create } from "zustand"

import en from "@/locales/en.json"
import pl from "@/locales/pl.json"
import ru from "@/locales/ru.json"
import es from "@/locales/es.json"
import de from "@/locales/de.json"
import { getSettingsStore, saveSetting } from "./settings-persistence"

export type Locale = "en" | "pl" | "ru" | "es" | "de"
export type LocalePreference = Locale | "auto"

const BUNDLES: Partial<Record<Locale, Record<string, string>>> = {
  en: en as Record<string, string>,
  pl: pl as Record<string, string>,
  ru: ru as Record<string, string>,
  es: es as Record<string, string>,
  de: de as Record<string, string>,
}

export type LocaleMeta = { id: Locale; label: string; nativeLabel: string; countryCode: string }

export const SUPPORTED_LOCALES: LocaleMeta[] = [
  { id: "en", label: "English", nativeLabel: "English", countryCode: "GB" },
  { id: "pl", label: "Polish", nativeLabel: "Polski", countryCode: "PL" },
  { id: "de", label: "German", nativeLabel: "Deutsch", countryCode: "DE" },
  {
    id: "ru",
    label: "Russian",
    nativeLabel: "\u0420\u0443\u0441\u0441\u043a\u0438\u0439",
    countryCode: "RU",
  },
  { id: "es", label: "Spanish", nativeLabel: "Espa\u00f1ol", countryCode: "ES" },
]

const SUPPORTED_IDS = new Set<Locale>(SUPPORTED_LOCALES.map((l) => l.id))
const DEFAULT_LOCALE: Locale = "en"

type I18nStore = {
  locale: Locale
  localePreference: LocalePreference
  detectedLocale: Locale
  setLocale: (locale: LocalePreference) => void
  hydrate: () => Promise<void>
}

export function detectSystemLocale(): Locale {
  if (typeof navigator === "undefined") return DEFAULT_LOCALE

  const languages = navigator.languages?.length ? navigator.languages : [navigator.language]
  for (const language of languages) {
    const base = language.toLowerCase().split(/[-_]/)[0] as Locale
    if (SUPPORTED_IDS.has(base)) return base
  }

  return DEFAULT_LOCALE
}

function resolveLocale(preference: LocalePreference, detectedLocale: Locale): Locale {
  return preference === "auto" ? detectedLocale : preference
}

export const useI18n = create<I18nStore>((set) => ({
  locale: DEFAULT_LOCALE,
  localePreference: "auto",
  detectedLocale: DEFAULT_LOCALE,
  setLocale: (localePreference) => {
    void saveSetting("locale", localePreference)
    const detectedLocale = detectSystemLocale()
    set({
      localePreference,
      detectedLocale,
      locale: resolveLocale(localePreference, detectedLocale),
    })
  },
  hydrate: async () => {
    try {
      const store = await getSettingsStore()
      const stored = await store.get<LocalePreference>("locale")
      const detectedLocale = detectSystemLocale()
      const localePreference =
        stored === "auto" || (stored && SUPPORTED_IDS.has(stored)) ? stored : "auto"

      set({
        localePreference,
        detectedLocale,
        locale: resolveLocale(localePreference, detectedLocale),
      })

      if (!stored) {
        void saveSetting("locale", "auto")
      }
    } catch {
      /* ignore */
    }
  },
}))

function translate(locale: Locale, key: string, vars?: Record<string, string | number>): string {
  const value = BUNDLES[locale]?.[key] ?? BUNDLES.en?.[key] ?? key
  if (!vars) return value
  return value.replace(/\{(\w+)\}/g, (_, name) => (name in vars ? String(vars[name]) : `{${name}}`))
}

/**
 * Translate a key. Falls back to the English bundle, then to the key itself.
 * Variables: t("hello.user", { name: "Alice" }) replaces {name}.
 */
export function t(key: string, vars?: Record<string, string | number>): string {
  const locale = useI18n.getState().locale
  return translate(locale, key, vars)
}

/** Hook variant - re-renders when the user switches locale. */
export function useT() {
  const locale = useI18n((s) => s.locale)
  return (key: string, vars?: Record<string, string | number>) => {
    return translate(locale, key, vars)
  }
}
