import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ErrorBoundary } from "@/components/error-boundary";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { useStore } from "@/lib/store";
import { useDisplayStore } from "@/lib/display-store";
import { useI18n } from "@/lib/i18n";
import "leaflet/dist/leaflet.css";
import "./index.css";

// Dev-only: expose stores on window for screenshot automation and debugging.
if (import.meta.env.DEV) {
  (window as unknown as { __geohelper__?: unknown }).__geohelper__ = {
    store: useStore,
    displayStore: useDisplayStore,
  };
}

function Root() {
  // Most call sites use the non-reactive `t()` helper, so remount the tree
  // when the locale changes to make the switch take effect everywhere.
  const locale = useI18n((s) => s.locale);
  return (
    <ErrorBoundary>
      <TooltipProvider delayDuration={200}>
        <App key={locale} />
        <Toaster />
      </TooltipProvider>
    </ErrorBoundary>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
