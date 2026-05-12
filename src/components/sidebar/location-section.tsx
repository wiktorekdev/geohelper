import ReactCountryFlag from "react-country-flag";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function LocationSection() {
  const place = useStore((s) => s.place);
  const details = useStore((s) => s.countryDetails);

  if (!place.country && !place.region && !place.city) {
    return <div className="p-5 text-sm text-muted-foreground">Locating…</div>;
  }

  const areaLine = uniqueLine(place.neighbourhood, place.city);

  const regionLine = uniqueLine(place.county, place.region);

  const continentLine = composeContinentLine(place.continent, details?.subregion);

  return (
    <div className="p-5 space-y-3">
      <div className="flex items-center gap-3">
        {place.countryCode && (
          <ReactCountryFlag
            countryCode={place.countryCode.toUpperCase()}
            svg
            style={{ width: "2.2em", height: "1.6em", borderRadius: "3px" }}
            title={place.country}
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="text-base font-semibold truncate">{place.country || "-"}</div>
          {continentLine && (
            <div className="text-[11px] text-muted-foreground truncate">{continentLine}</div>
          )}
        </div>
      </div>

      <div className="space-y-0.5">
        {areaLine && <div className="text-sm truncate">{areaLine}</div>}
        {regionLine && (
          <div className={cn("text-[11px] text-muted-foreground truncate")}>{regionLine}</div>
        )}
      </div>
    </div>
  );
}

function uniqueLine(...values: Array<string | undefined>): string {
  const seen = new Set<string>();
  const parts: string[] = [];
  for (const value of values) {
    if (!value || seen.has(value)) continue;
    seen.add(value);
    parts.push(value);
  }
  return parts.join(" - ");
}

function composeContinentLine(continent?: string, subregion?: string): string {
  if (!continent && !subregion) return "";
  if (!continent) return subregion!;
  if (!subregion) return continent;
  if (subregion === continent) return continent;
  if (subregion.toLowerCase().includes(continent.toLowerCase())) return subregion;
  return `${continent} - ${subregion}`;
}
