import ReactCountryFlag from "react-country-flag";

import { deriveLocationDisplay } from "@/lib/location-display";
import { useStore } from "@/lib/store";
import { SelectableText } from "@/components/display/selectable-text";
import { FLAG_SIZE, useDisplayStore } from "@/lib/display-store";

export function LocationSection() {
  const place = useStore((s) => s.place);
  const details = useStore((s) => s.countryDetails);
  const geocodeError = useStore((s) => s.geocodeError);
  const current = useStore((s) => s.current);
  const locationLoading = useStore((s) => s.locationLoading);
  const display = deriveLocationDisplay(place, details, current, geocodeError, locationLoading);

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
      return <SettlementView display={display} />;
  }
}

function SettlementView({
  display,
}: {
  display: Extract<ReturnType<typeof deriveLocationDisplay>, { kind: "settlement" }>;
}) {
  const flagStyle = useDisplayStore((s) => s.textStyles["country.flag"]);
  const flagSize = FLAG_SIZE[flagStyle?.fontSize ?? "md"];
  const fontSizePx = flagStyle?.fontSize ? { sm: 11, md: 13, lg: 15 }[flagStyle.fontSize] : 13;

  return (
    <div className="space-y-3 p-5">
      <div className="flex items-center gap-3">
        {display.countryCode && (
          <SelectableText id="country.flag">
            <span
              className="inline-flex align-middle"
              style={{
                width: flagSize.width,
                height: flagSize.height,
                borderRadius: `${fontSizePx * 0.18}px`,
                overflow: "hidden",
                isolation: "isolate",
                fontSize: `${fontSizePx}px`,
              }}
            >
              <ReactCountryFlag
                countryCode={display.countryCode.toUpperCase()}
                svg
                style={{ width: "100%", height: "100%", display: "block" }}
                title={display.country}
              />
            </span>
          </SelectableText>
        )}
        <div className="min-w-0 flex-1">
          <div className="truncate text-base font-semibold">
            <SelectableText id="country.title">{display.country}</SelectableText>
          </div>
          {display.continentLine && (
            <div className="truncate text-[11px] text-muted-foreground">
              <SelectableText id="country.continent">{display.continentLine}</SelectableText>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-0.5">
        {display.areaLine && (
          <div className="truncate text-sm">
            <SelectableText id="country.area">{display.areaLine}</SelectableText>
          </div>
        )}
        {display.regionLine && (
          <div className="truncate text-[11px] text-muted-foreground">
            <SelectableText id="country.region">{display.regionLine}</SelectableText>
          </div>
        )}
      </div>
    </div>
  );
}
