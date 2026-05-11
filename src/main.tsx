import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ErrorBoundary } from "@/components/error-boundary";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { useStore } from "@/lib/store";
import { useDisplayStore } from "@/lib/display-store";
import "./index.css";
import "leaflet/dist/leaflet.css";

// Dev-only: expose stores on window for screenshot automation and debugging.
if (import.meta.env.DEV) {
  (window as unknown as { __geohelper__?: unknown }).__geohelper__ = {
    store: useStore,
    displayStore: useDisplayStore,
  };
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <TooltipProvider delayDuration={200}>
        <App />
        <Toaster />
      </TooltipProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
