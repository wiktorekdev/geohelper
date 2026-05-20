import { useEffect, useState, useCallback } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { X } from "lucide-react";

import { MAP_PROVIDERS } from "@/lib/map-providers";
import { useStore } from "@/lib/store";
import { useDisplayStore } from "@/lib/display-store";
import { GoogleMapView } from "./google-map-view";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ColorPicker, ColorPickerSelection, ColorPickerHue } from "@/components/ui/color-picker";

function MarkerColorSection({
  label,
  color,
  onChange,
}: {
  label: string;
  color: string;
  onChange: (color: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [inputVal, setInputVal] = useState(color);

  useEffect(() => {
    if (!open) setInputVal(color);
  }, [color, open]);

  const handleChange = useCallback((val: unknown) => {
    if (val && Array.isArray(val)) {
      const hex = "#" + val.slice(0, 3).map((c: number) => Math.round(c).toString(16).padStart(2, "0")).join("");
      onChange(hex);
      setInputVal(hex);
    }
  }, [onChange]);

  return (
    <div className="flex items-center justify-between py-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-sidebar-border bg-sidebar hover:bg-accent text-xs font-semibold shadow-sm transition-all active:scale-95 hover:scale-[1.02] min-w-[5.5rem] justify-between"
          >
            <span className="w-3.5 h-3.5 rounded-full border border-border/80 shadow-sm shrink-0" style={{ backgroundColor: color }}></span>
            <span className="font-mono uppercase text-[10px] text-foreground/80 shrink-0">{color}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="right"
          align="center"
          sideOffset={12}
          className="z-[2200] w-64 p-4 border border-sidebar-border bg-sidebar text-sidebar-foreground rounded-xl shadow-2xl backdrop-blur-md"
        >
          <ColorPicker value={color} onChange={handleChange} className="flex flex-col gap-3">
            <ColorPickerSelection className="h-32 rounded-lg border border-sidebar-border" />
            <ColorPickerHue />
          </ColorPicker>
          <div className="mt-3 flex items-center gap-1.5 border-t border-sidebar-border pt-3">
            <span className="text-[10px] text-muted-foreground font-mono">HEX:</span>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => {
                setInputVal(e.target.value);
                if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                  onChange(e.target.value);
                }
              }}
              className="h-7 flex-1 rounded border border-sidebar-border bg-background px-2 text-xs font-mono uppercase focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function MapPanel() {
  const current = useStore((s) => s.current);
  const providerId = useStore((s) => s.mapProvider);
  const apiKey = useStore((s) => s.googleApiKey);
  const provider = MAP_PROVIDERS[providerId] || MAP_PROVIDERS["osm"];

  const markerColor = useStore((s) => s.markerColor);
  const setMarkerColor = useStore((s) => s.setMarkerColor);
  const markerBorderColor = useStore((s) => s.markerBorderColor);
  const setMarkerBorderColor = useStore((s) => s.setMarkerBorderColor);
  const markerSize = useStore((s) => s.markerSize);
  const setMarkerSize = useStore((s) => s.setMarkerSize);

  const editing = useDisplayStore((s) => s.editing);
  const [editingMarker, setEditingMarker] = useState(false);

  useEffect(() => {
    if (!editing) {
      setEditingMarker(false);
    }
  }, [editing]);

  const pinIcon = L.divIcon({
    className: "",
    iconSize: [markerSize, markerSize],
    iconAnchor: [markerSize / 2, markerSize / 2],
    html: `
    <style>
      .marker-container-${markerSize} {
        transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1);
      }
      ${editing ? `
      .marker-container-${markerSize}:hover {
        transform: scale(1.15);
      }
      ` : ""}
    </style>
    <div class="marker-container-${markerSize}" style="
      width:${markerSize}px; height:${markerSize}px; position:relative;
      filter: drop-shadow(0 2.5px 4.5px rgba(0,0,0,0.35));
      cursor: ${editing ? "pointer" : "default"};
    ">
      <div style="
        position:absolute; inset:0;
        background:${markerColor};
        border-radius:9999px;
        border:${Math.max(2, Math.round(markerSize / 8))}px solid ${markerBorderColor};
      "></div>
      ${editing ? `
      <div style="
        position:absolute;
        top:-3px; right:-3px;
        width:14px; height:14px;
        background:#3b82f6;
        color:#ffffff;
        border-radius:9999px;
        border:1px solid #ffffff;
        display:flex;
        align-items:center;
        justify-content:center;
        box-shadow:0 1px 2px rgba(0,0,0,0.3);
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 20h9"/>
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
        </svg>
      </div>
      ` : ""}
    </div>
  `,
  });

  return (
    <div className="relative flex-1 min-h-0">
      {provider.kind === "google" ? (
        <GoogleMapView
          apiKey={apiKey}
          mapTypeId={provider.mapTypeId}
          styles={provider.styles}
          center={current ? { lat: current.lat, lng: current.lng } : null}
          onMarkerClick={() => {
            if (editing) {
              setEditingMarker(true);
            }
          }}
        />
      ) : (
        <MapContainer
          center={[20, 0]}
          zoom={2}
          scrollWheelZoom
          worldCopyJump
          className="absolute inset-0"
          maxBounds={[
            [-85, -10000],
            [85, 10000],
          ]}
          maxBoundsViscosity={1.0}
        >
          <TileLayer
            url={provider.url}
            attribution={provider.attribution}
            maxZoom={provider.maxZoom}
            subdomains={provider.subdomains ?? "abc"}
          />
          {current && (
            <>
              <Marker
                position={[current.lat, current.lng]}
                icon={pinIcon}
                eventHandlers={{
                  click: () => {
                    if (editing) {
                      setEditingMarker(true);
                    }
                  },
                }}
              />
              <PanTo lat={current.lat} lng={current.lng} />
            </>
          )}
          <ResetMapWhenNoCoords active={!current} />
          <InvalidateMapSize />
        </MapContainer>
      )}

      {/* FLOATING MARKER CUSTOMIZATION PANEL */}
      {editing && editingMarker && (
        <div className="absolute bottom-4 left-4 z-[1000] w-72 rounded-xl border border-sidebar-border bg-sidebar/95 p-4 shadow-2xl backdrop-blur-md transition-all duration-200 text-sidebar-foreground animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between border-b border-sidebar-border pb-2.5 mb-3.5">
            <h4 className="text-xs font-semibold tracking-wide text-foreground flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full inline-block animate-pulse shrink-0" style={{ backgroundColor: markerColor, border: `1.5px solid ${markerBorderColor}` }}></span>
              {t("marker.customizeTitle")}
            </h4>
            <Button size="icon" variant="ghost" className="size-6 text-muted-foreground hover:text-foreground" onClick={() => setEditingMarker(false)}>
              <X className="size-4" />
            </Button>
          </div>
          
          <div className="space-y-3">
            <MarkerColorSection
              label={t("marker.color")}
              color={markerColor}
              onChange={setMarkerColor}
            />

            <MarkerColorSection
              label={t("marker.borderColor")}
              color={markerBorderColor}
              onChange={setMarkerBorderColor}
            />

            {/* Size section */}
            <div className="space-y-2 border-t border-sidebar-border pt-3.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{t("marker.size")}</label>
                <span className="text-xs font-mono font-medium text-foreground bg-accent px-1.5 py-0.5 rounded">{markerSize}px</span>
              </div>
              <input
                type="range"
                min="16"
                max="48"
                value={markerSize}
                onChange={(e) => setMarkerSize(Number(e.target.value))}
                className="w-full h-1 bg-accent rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PanTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  useEffect(() => {
    // Project target coordinate to pixel space at current zoom level
    const targetPoint = map.project([lat, lng], map.getZoom());
    const halfHeight = map.getSize().y / 2;

    // Project map boundaries (-85 to 85 degrees latitude) to pixel space
    const southWestPixel = map.project([-85, -180], map.getZoom());
    const northEastPixel = map.project([85, 180], map.getZoom());

    // Clamp Y-coordinate so map doesn't show areas beyond the poles
    const minY = northEastPixel.y + halfHeight;
    const maxY = southWestPixel.y - halfHeight;

    let clampedY = targetPoint.y;
    if (minY < maxY) {
      clampedY = Math.max(minY, Math.min(maxY, targetPoint.y));
    }

    // Unproject back to lat/lng coordinates
    const clampedCenter = map.unproject([targetPoint.x, clampedY], map.getZoom());

    map.panTo(clampedCenter, { animate: true, duration: 0.6 });
  }, [lat, lng, map]);

  return null;
}

/** Leaflet keeps the last panned viewport; snap back when coords clear (e.g. exit layout edit). */
function ResetMapWhenNoCoords({ active }: { active: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (!active) return;
    map.setView([20, 0], 2, { animate: true, duration: 0.45 });
  }, [active, map]);

  return null;
}

function InvalidateMapSize() {
  const map = useMap();
  const sidebarWidth = useDisplayStore((s) => s.sidebarWidth);
  const editing = useDisplayStore((s) => s.editing);
  const mapVisible = useDisplayStore((s) => s.mapVisible);

  useEffect(() => {
    // 1. Invalidate size immediately for fast visual feedback
    map.invalidateSize({ animate: false });

    // 2. Invalidate size after layout transitions settle
    const timer = setTimeout(() => {
      map.invalidateSize({ animate: true });
    }, 400);

    return () => clearTimeout(timer);
  }, [sidebarWidth, editing, mapVisible, map]);

  return null;
}
