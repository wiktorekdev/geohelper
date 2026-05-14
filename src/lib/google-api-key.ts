export type GoogleApiKeyValidation =
  | { ok: true; message: string }
  | { ok: false; message: string };

export async function validateGoogleApiKey(
  apiKey: string,
  signal?: AbortSignal,
): Promise<GoogleApiKeyValidation> {
  const key = apiKey.trim();
  if (!key) return { ok: false, message: "Google Maps API key is required." };

  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=0,0&key=${encodeURIComponent(key)}&language=en`;
  const res = await fetch(url, { signal: timeoutSignal(undefined, signal) });
  if (!res.ok) return { ok: false, message: `Google returned HTTP ${res.status}.` };

  const data = (await res.json()) as {
    status?: string;
    error_message?: string;
  };

  switch (data.status) {
    case "OK":
    case "ZERO_RESULTS":
      return { ok: true, message: "Google API key looks valid." };
    case "REQUEST_DENIED":
      return {
        ok: false,
        message: data.error_message || "Google rejected this API key.",
      };
    case "OVER_QUERY_LIMIT":
      return {
        ok: false,
        message: "Google accepted the key, but the quota is exhausted.",
      };
    default:
      return {
        ok: false,
        message: data.error_message || `Google returned ${data.status || "an unknown status"}.`,
      };
  }
}
import { timeoutSignal } from "./fetch-timeout";
