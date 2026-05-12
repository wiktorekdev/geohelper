import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { openUrl } from "@tauri-apps/plugin-opener";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { GoogleMaps } from "@/components/ui/svgs/googleMaps";
import { formatCoords, useStore } from "@/lib/store";
import { useDisplayStore } from "@/lib/display-store";
import { formatCoord } from "@/lib/utils";

// Fallback used while in edit mode if no real round is loaded yet. Matches
// the mock data we inject on enter so the preview feels consistent.
const MOCK_COORDS = { lat: 48.8566, lng: 2.3522, source: "mock", timestamp: 0 };

export function CoordsSection() {
  const current = useStore((s) => s.current);
  const editing = useDisplayStore((s) => s.editing);
  const copyFormat = useStore((s) => s.copyFormat);
  const [copied, setCopied] = useState(false);

  const coords = current ?? (editing ? MOCK_COORDS : null);
  if (!coords) return null;

  const lat = formatCoord(coords.lat);
  const lng = formatCoord(coords.lng);

  async function copy() {
    const text = formatCoords(coords!, copyFormat);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      toast.success("Coordinates copied", { description: text });
    } catch {
      toast.error("Clipboard unavailable");
    }
  }

  function openInGoogleMaps() {
    const q = `${coords!.lat},${coords!.lng}`;
    void openUrl(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`);
  }

  return (
    <div className="mx-4 my-3 rounded-md border border-sidebar-border bg-background/40 p-3">
      <div className="grid grid-cols-2 gap-2">
        <Value label="Lat" value={lat} />
        <Value label="Lng" value={lng} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Action onClick={copy}>
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? "Copied" : "Copy"}
            </Action>
          </TooltipTrigger>
          <TooltipContent side="bottom">Copy lat/lng to clipboard</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Action onClick={openInGoogleMaps}>
              <GoogleMaps className="size-3.5" />
              Google Maps
            </Action>
          </TooltipTrigger>
          <TooltipContent side="bottom">Open in Google Maps</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

function Value({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-sidebar-border bg-background/50 px-2.5 py-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-0.5 truncate font-mono text-[12px] tabular-nums">{value}</div>
    </div>
  );
}

function Action({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="h-8 gap-1.5 border-sidebar-border text-xs text-muted-foreground hover:text-foreground"
    >
      {children}
    </Button>
  );
}
