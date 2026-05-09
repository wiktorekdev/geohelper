import type { CountryDetails } from "@/types";

const CACHE = new Map<string, CountryDetails | null>();
const INFLIGHT = new Map<string, Promise<CountryDetails | null>>();

const FIELDS = "flag,capital,subregion,languages,currencies,idd,timezones";

export function fetchCountryDetails(code: string): Promise<CountryDetails | null> {
  const cc = code.toLowerCase();
  if (CACHE.has(cc)) return Promise.resolve(CACHE.get(cc)!);
  const existing = INFLIGHT.get(cc);
  if (existing) return existing;

  const promise = (async () => {
    try {
      const res = await fetch(
        `https://restcountries.com/v3.1/alpha/${cc}?fields=${FIELDS}`,
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const entry = Array.isArray(data) ? data[0] : data;
      if (!entry) throw new Error("empty");

      const languages = entry.languages
        ? (Object.values(entry.languages) as string[])
        : undefined;

      const currencyKey = entry.currencies ? Object.keys(entry.currencies)[0] : undefined;
      const currencyEntry = currencyKey ? entry.currencies[currencyKey] : undefined;
      const currency = currencyEntry
        ? `${currencyKey}${currencyEntry.symbol ? ` (${currencyEntry.symbol})` : ""}`
        : undefined;

      const idd = entry.idd;
      const callingCode =
        idd?.root && idd.suffixes?.length === 1
          ? `${idd.root}${idd.suffixes[0]}`
          : idd?.root;

      const details: CountryDetails = {
        flag: entry.flag,
        capital: entry.capital?.[0],
        subregion: entry.subregion,
        languages,
        currency,
        callingCode,
        timezones: entry.timezones,
      };

      CACHE.set(cc, details);
      return details;
    } catch {
      CACHE.set(cc, null);
      return null;
    } finally {
      INFLIGHT.delete(cc);
    }
  })();

  INFLIGHT.set(cc, promise);
  return promise;
}

export function localTimeFromOffset(utcOffset?: string): string | undefined {
  if (!utcOffset) return undefined;
  const m = utcOffset.match(/UTC([+-])(\d{2}):(\d{2})/);
  if (!m) return undefined;

  const sign = m[1] === "+" ? 1 : -1;
  const h = parseInt(m[2], 10);
  const min = parseInt(m[3], 10);
  const offsetMinutes = sign * (h * 60 + min);

  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60_000;
  const local = new Date(utcMs + offsetMinutes * 60_000);
  return local.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
