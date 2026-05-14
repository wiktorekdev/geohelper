import { lazy, Suspense } from "react";

const MapPanel = lazy(() =>
  import("./map-panel").then((module) => ({ default: module.MapPanel })),
);

export function MapView() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full flex-1 items-center justify-center bg-background text-xs text-muted-foreground">
          Loading map...
        </div>
      }
    >
      <MapPanel />
    </Suspense>
  );
}
