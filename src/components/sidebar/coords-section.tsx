import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { openUrl } from "@tauri-apps/plugin-opener";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { GoogleMaps } from "@/components/ui/svgs/googleMaps";
import { useStore } from "@/lib/store";
import { useDisplayStore } from "@/lib/display-store";
import { formatCoord, formatCoords } from "@/lib/coords";
import { MOCK_COORDS } from "@/lib/mock-data";
import { SelectableText } from "@/components/display/selectable-text";
import { t } from "@/lib/i18n";

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
      toast.success(t("coordinates.copySuccess"), { description: text });
    } catch {
      toast.error(t("coordinates.clipboardError"));
    }
  }

  function openInGoogleMaps() {
    const q = `${coords!.lat},${coords!.lng}`;
    void openUrl(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`);
  }

  return (
    <Card className="mx-4 my-2 p-3">
      <div className="grid grid-cols-2 gap-2">
        <Value id="coordinates.lat" label={t("coordinates.lat")} value={lat} />
        <Value id="coordinates.lng" label={t("coordinates.lng")} value={lng} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <SelectableText id="coordinates.action.copy" className="block">
          <Tooltip>
            <TooltipTrigger asChild>
              <Action onClick={copy}>
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? t("coordinates.copied") : t("coordinates.copy")}
              </Action>
            </TooltipTrigger>
            <TooltipContent side="bottom">{t("coordinates.copyTooltip")}</TooltipContent>
          </Tooltip>
        </SelectableText>
        <SelectableText id="coordinates.action.maps" className="block">
          <Tooltip>
            <TooltipTrigger asChild>
              <Action onClick={openInGoogleMaps}>
                <GoogleMaps className="size-3.5" />
                {t("coordinates.googleMaps")}
              </Action>
            </TooltipTrigger>
            <TooltipContent side="bottom">{t("coordinates.mapsTooltip")}</TooltipContent>
          </Tooltip>
        </SelectableText>
      </div>
    </Card>
  );
}

function Value({ id, label, value }: { id: string; label: string; value: string }) {
  return (
    <div className="rounded border border-sidebar-border bg-background/50 px-2.5 py-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
        <SelectableText id={`${id}.label`}>{label}</SelectableText>
      </div>
      <div className="mt-0.5 truncate font-mono text-[12px] tabular-nums">
        <SelectableText id={`${id}.value`} mono>
          {value}
        </SelectableText>
      </div>
    </div>
  );
}

function Action({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="h-8 w-full gap-1.5 border-sidebar-border text-xs text-muted-foreground hover:text-foreground"
    >
      {children}
    </Button>
  );
}
