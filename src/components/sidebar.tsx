import { Settings as SettingsIcon, Check, Copy, ExternalLink } from "lucide-react";
import { type ReactNode, useState } from "react";
import ReactCountryFlag from "react-country-flag";
import { openUrl } from "@tauri-apps/plugin-opener";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SocialFooter } from "./social-footer";
import { UpdateBanner } from "./update-banner";
import { formatCoords, useStore } from "@/lib/store";
import { cn, formatCoord } from "@/lib/utils";
import { localTimeFromOffset } from "@/lib/country-info";
import logoUrl from "@/assets/logo.png";

export function Sidebar() {
  const openSettings = useStore((s) => s.openSettings);
  const conn = useStore((s) => s.conn);
  const current = useStore((s) => s.current);

  return (
    <aside className="flex h-full w-[320px] shrink-0 flex-col bg-sidebar border-r border-sidebar-border">
      <header className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <img src={logoUrl} alt="" className="h-8 w-8 shrink-0" />
          <div className="text-[15px] font-semibold tracking-tight">GeoHelper</div>
        </div>
        <div className="flex items-center gap-2">
          <StatusDot conn={conn} />
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={openSettings}>
            <SettingsIcon className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <ScrollArea className="flex-1">
        {current ? (
          <>
            <Location />
            <CountryBits />
            <GeocodeNotice />
            <CoordsRow />
          </>
        ) : (
          <EmptyState conn={conn} />
        )}
      </ScrollArea>

      <UpdateBanner />
      <SocialFooter />
    </aside>
  );
}

function StatusDot({ conn }: { conn: ReturnType<typeof useStore.getState>["conn"] }) {
  const { tone, title } = describe(conn);
  return (
    <span
      title={title}
      className={cn(
        "h-1.5 w-1.5 rounded-full",
        tone === "ok" && "bg-emerald-500",
        tone === "warn" && "bg-amber-500 animate-pulse",
        tone === "bad" && "bg-rose-500",
      )}
    />
  );
}

function describe(conn: ReturnType<typeof useStore.getState>["conn"]) {
  switch (conn.kind) {
    case "connected":
      return { tone: "ok" as const, title: "Connected to GeoGuessr" };
    case "searching":
      return { tone: "warn" as const, title: "Looking for GeoGuessr..." };
    case "disconnected":
      return { tone: "bad" as const, title: `Disconnected: ${conn.reason}` };
    default:
      return { tone: "warn" as const, title: "Idle" };
  }
}

function EmptyState({ conn }: { conn: ReturnType<typeof useStore.getState>["conn"] }) {
  if (conn.kind === "connected") {
    return (
      <div className="flex-1 flex items-center justify-center py-16 text-xs text-muted-foreground">
        Waiting for a round...
      </div>
    );
  }

  return (
    <div className="px-5 py-10 space-y-3 text-center">
      <div className="text-sm text-muted-foreground">Not connected</div>
      <div className="mx-auto max-w-[260px] rounded-md border border-sidebar-border bg-background/50 p-3 text-left text-[11px] text-muted-foreground leading-relaxed">
        Make sure GeoGuessr is launched with:
        <code className="mt-1.5 block rounded bg-accent px-2 py-1 font-mono text-[10px] break-all">
          --remote-debugging-port=9222 --remote-allow-origins=*
        </code>
      </div>
    </div>
  );
}

function Location() {
  const place = useStore((s) => s.place);
  const details = useStore((s) => s.countryDetails);

  if (!place.country && !place.region && !place.city) {
    return (
      <div className="px-5 py-5 text-sm text-muted-foreground">Locating...</div>
    );
  }

  const areaLine = [place.neighbourhood, place.city]
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i)
    .join(" - ");

  const regionLine = [place.county, place.region]
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i)
    .join(" - ");

  const continentLine = composeContinentLine(place.continent, details?.subregion);

  return (
    <div className="px-5 py-5 space-y-3">
      <div className="flex items-center gap-3">
        {place.countryCode && (
          <ReactCountryFlag
            countryCode={place.countryCode.toUpperCase()}
            svg
            style={{ width: "2.2em", height: "1.6em", borderRadius: "3px" }}
            title={place.country}
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="text-base font-semibold truncate">{place.country || "-"}</div>
          {continentLine && (
            <div className="text-[11px] text-muted-foreground truncate">{continentLine}</div>
          )}
        </div>
      </div>

      <div className="space-y-0.5">
        {areaLine && <div className="text-sm truncate">{areaLine}</div>}
        {regionLine && (
          <div className="text-[11px] text-muted-foreground truncate">{regionLine}</div>
        )}
      </div>

      {(place.road || place.postcode) && (
        <div className="space-y-0.5 pt-1 border-t border-sidebar-border">
          {place.road && (
            <InfoRow label="Road" value={place.road} />
          )}
          {place.postcode && (
            <InfoRow label="Postcode" value={place.postcode} mono />
          )}
        </div>
      )}
    </div>
  );
}

function composeContinentLine(continent?: string, subregion?: string): string {
  if (!continent && !subregion) return "";
  if (!continent) return subregion!;
  if (!subregion) return continent;
  if (subregion === continent) return continent;
  if (subregion.toLowerCase().includes(continent.toLowerCase())) return subregion;
  return `${continent} - ${subregion}`;
}

function CountryBits() {
  const details = useStore((s) => s.countryDetails);
  if (!details) return null;

  const hasAny =
    details.languages?.length || details.currency || details.callingCode || details.timezones?.length || details.capital;
  if (!hasAny) return null;

  const localTime = details.timezones?.[0]
    ? localTimeFromOffset(details.timezones[0])
    : undefined;

  return (
    <div className="px-5 pb-4 pt-3 border-t border-sidebar-border space-y-1">
      {details.languages && details.languages.length > 0 && (
        <InfoRow label="Language" value={details.languages.slice(0, 2).join(", ")} />
      )}
      {details.currency && <InfoRow label="Currency" value={details.currency} />}
      {details.callingCode && <InfoRow label="Phone" value={details.callingCode} />}
      {localTime && <InfoRow label="Local time" value={localTime} />}
      {details.capital && <InfoRow label="Capital" value={details.capital} />}
    </div>
  );
}

function GeocodeNotice() {
  const error = useStore((s) => s.geocodeError);
  if (!error) return null;

  return (
    <div className="mx-4 mb-3 rounded-md border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-300">
      Location lookup failed: {error}
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2 text-xs pt-1">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("truncate ml-2", mono && "font-mono")}>{value}</span>
    </div>
  );
}

function CoordsRow() {
  const current = useStore((s) => s.current)!;
  const copyFormat = useStore((s) => s.copyFormat);
  const [copied, setCopied] = useState(false);
  const lat = formatCoord(current.lat);
  const lng = formatCoord(current.lng);

  async function copy() {
    await navigator.clipboard.writeText(formatCoords(current, copyFormat)).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function openInGoogleMaps() {
    const query = `${current.lat},${current.lng}`;
    void openUrl(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`);
  }

  function openInStreetView() {
    void openUrl(`https://www.google.com/maps?layer=c&cbll=${current.lat},${current.lng}`);
  }

  return (
    <div className="mx-4 my-3 rounded-md border bg-background/40 p-3">
      <div className="grid grid-cols-2 gap-2">
        <CoordValue label="Lat" value={lat} />
        <CoordValue label="Lng" value={lng} />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <CoordAction onClick={copy}>
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </CoordAction>
        <CoordAction onClick={openInGoogleMaps}>
          <ExternalLink className="h-3.5 w-3.5" />
          Maps
        </CoordAction>
        <CoordAction onClick={openInStreetView}>
          <ExternalLink className="h-3.5 w-3.5" />
          Street
        </CoordAction>
      </div>
    </div>
  );
}

function CoordValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-sidebar-border bg-background/50 px-2.5 py-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-0.5 truncate font-mono text-[12px] tabular-nums">{value}</div>
    </div>
  );
}

function CoordAction({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-sidebar-border text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      {children}
    </button>
  );
}
