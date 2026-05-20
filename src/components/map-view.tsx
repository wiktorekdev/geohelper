import { lazy, Suspense } from "react"

import { useT } from "@/lib/i18n"

const MapPanel = lazy(() => import("./map-panel").then((module) => ({ default: module.MapPanel })))

export function MapView() {
  const t = useT()
  return (
    <Suspense
      fallback={
        <div className="flex h-full flex-1 items-center justify-center bg-background text-xs text-muted-foreground">
          {t("map.loading")}
        </div>
      }
    >
      <MapPanel />
    </Suspense>
  )
}
