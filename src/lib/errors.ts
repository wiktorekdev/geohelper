import { t } from "@/lib/i18n"

export function errorMessage(error: unknown, fallback?: string): string {
  return error instanceof Error ? error.message : fallback || t("error.unexpected")
}
