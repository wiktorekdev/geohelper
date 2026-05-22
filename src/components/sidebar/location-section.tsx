import { m, AnimatePresence } from "motion/react"
import ReactCountryFlag from "react-country-flag"

import { Card } from "@/components/ui/card"
import { deriveLocationDisplay } from "@/lib/location-display"
import { useStore } from "@/lib/store"
import { SelectableText } from "@/components/display/selectable-text"
import { FLAG_SIZE, useDisplayStore } from "@/lib/display-store"
import { useT } from "@/lib/i18n"

export function LocationSection() {
  const t = useT()
  const place = useStore((s) => s.place)
  const details = useStore((s) => s.countryDetails)
  const geocodeError = useStore((s) => s.geocodeError)
  const current = useStore((s) => s.current)
  const locationLoading = useStore((s) => s.locationLoading)
  const display = deriveLocationDisplay(place, details, current, geocodeError, locationLoading)

  function renderContent() {
    switch (display.kind) {
      case "error":
        return (
          <Card className="mx-4 my-2 p-4 text-sm text-muted-foreground">
            {t("location.couldNotShow")}
          </Card>
        )
      case "sparse":
        return (
          <Card className="mx-4 my-2 p-4 space-y-2">
            <div className="text-sm font-medium leading-snug">{display.primary}</div>
            {display.continent && (
              <div className="text-[11px] text-muted-foreground">{display.continent}</div>
            )}
            <div className="text-[11px] text-muted-foreground">
              {t("location.settlementNotInData")}
            </div>
          </Card>
        )
      case "loading":
        return (
          <Card className="mx-4 my-2 p-4 space-y-1 text-sm text-muted-foreground">
            {display.rough ? (
              <div className="text-[13px] text-foreground/90">{display.rough}</div>
            ) : null}
            <div className="text-[11px]">{t("location.fetchingAddress")}</div>
          </Card>
        )
      case "empty":
        return (
          <Card className="mx-4 my-2 p-4 text-sm text-muted-foreground">{t("location.empty")}</Card>
        )
      case "settlement":
        return <SettlementView display={display} />
    }
  }

  return (
    <AnimatePresence mode="wait">
      <m.div
        key={display.kind}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
      >
        {renderContent()}
      </m.div>
    </AnimatePresence>
  )
}

function SettlementView({
  display,
}: {
  display: Extract<ReturnType<typeof deriveLocationDisplay>, { kind: "settlement" }>
}) {
  const flagStyle = useDisplayStore((s) => s.textStyles["country.flag"])
  const flagSize = FLAG_SIZE[flagStyle?.fontSize ?? "md"]
  const fontSizePx = flagStyle?.fontSize ? { sm: 11, md: 13, lg: 15 }[flagStyle.fontSize] : 13
  // Slightly non-linear so the rounding stays visually obvious at the large size
  // where a strict proportional radius would feel harsh.
  const flagRadius = Math.round(fontSizePx * 0.28)

  return (
    <Card className="mx-4 my-2 p-4 space-y-3">
      <div className="flex items-center gap-3">
        {display.countryCode && (
          <SelectableText id="country.flag">
            <span
              className="inline-flex align-middle transition-[width,height,border-radius,font-size] duration-200 ease-out"
              style={{
                width: flagSize.width,
                height: flagSize.height,
                borderRadius: `${flagRadius}px`,
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
    </Card>
  )
}
