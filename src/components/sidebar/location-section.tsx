import ReactCountryFlag from "react-country-flag";

import { deriveLocationDisplay } from "@/lib/location-display";
import { useStore } from "@/lib/store";

export function LocationSection() {
  const place = useStore((s) => s.place);
  const details = useStore((s) => s.countryDetails);
  const geocodeError = useStore((s) => s.geocodeError);
  const current = useStore((s) => s.current);
  const display = deriveLocationDisplay(place, details, current, geocodeError);

  switch (display.kind) {
    case "error":
      return (
        <div className="p-5 text-sm text-muted-foreground">
          Couldn't show named geography. See the notice above this list for the error detail.
        </div>
      );
    case "sparse":
      return (
        <div className="space-y-2 p-5">
          <div className="text-sm font-medium leading-snug">{display.primary}</div>
          {display.continent && (
            <div className="text-[11px] text-muted-foreground">{display.continent}</div>
          )}
          <div className="text-[11px] text-muted-foreground">Settlement name not in geocoder data.</div>
        </div>
      );
    case "continent":
      return (
        <div className="space-y-2 p-5">
          <div className="text-base font-semibold">{display.continent}</div>
          <div className="text-[11px] leading-relaxed text-muted-foreground">
            Only a coarse region was returned (remote or sparse map data). Coordinates on the map are
            still exact.
          </div>
        </div>
      );
    case "loading":
      return (
        <div className="space-y-1 p-5 text-sm text-muted-foreground">
          {display.rough ? <div className="text-[13px] text-foreground/90">{display.rough}</div> : null}
          <div className="text-[11px]">Fetching address...</div>
        </div>
      );
    case "empty":
      return <div className="p-5 text-sm text-muted-foreground">-</div>;
    case "settlement":
      return (
        <div className="space-y-3 p-5">
          <div className="flex items-center gap-3">
            {display.countryCode && (
              <ReactCountryFlag
                countryCode={display.countryCode.toUpperCase()}
                svg
                style={{ width: "2.2em", height: "1.6em", borderRadius: "3px" }}
                title={display.country}
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="truncate text-base font-semibold">{display.country}</div>
              {display.continentLine && (
                <div className="truncate text-[11px] text-muted-foreground">
                  {display.continentLine}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-0.5">
            {display.areaLine && <div className="truncate text-sm">{display.areaLine}</div>}
            {display.regionLine && (
              <div className="truncate text-[11px] text-muted-foreground">
                {display.regionLine}
              </div>
            )}
          </div>
        </div>
      );
  }
}
