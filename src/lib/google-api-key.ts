import { timeoutSignal } from "./fetch-timeout";
import { t } from "@/lib/i18n";

export type GoogleApiKeyValidation =
  | { ok: true; message: string }
  | { ok: false; message: string };

export async function validateGoogleApiKey(
  apiKey: string,
  signal?: AbortSignal,
): Promise<GoogleApiKeyValidation> {
  const key = apiKey.trim();
  if (!key) return { ok: false, message: t("validation.required") };

  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=0,0&key=${encodeURIComponent(key)}&language=en`;
  const res = await fetch(url, { signal: timeoutSignal(undefined, signal) });
  if (!res.ok) return { ok: false, message: t("validation.httpError", { status: res.status.toString() }) };

  const data = (await res.json()) as {
    status?: string;
    error_message?: string;
  };

  switch (data.status) {
    case "OK":
    case "ZERO_RESULTS":
      return { ok: true, message: t("validation.valid") };
    case "REQUEST_DENIED":
      return {
        ok: false,
        message: data.error_message || t("validation.rejected"),
      };
    case "OVER_QUERY_LIMIT":
      return {
        ok: false,
        message: t("validation.quotaExhausted"),
      };
    default:
      return {
        ok: false,
        message: data.error_message || t("validation.unknownStatus", { status: data.status || "an unknown status" }),
      };
  }
}
