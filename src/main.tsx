import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ErrorBoundary } from "@/components/error-boundary";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import "./index.css";
import "leaflet/dist/leaflet.css";

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
