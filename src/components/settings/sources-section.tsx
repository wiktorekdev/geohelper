import { ExternalLink, Eye, EyeOff, Layers, Lock } from "lucide-react";
import { openUrl } from "@tauri-apps/plugin-opener";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KeyValidationMessage, Field, Group } from "./settings-primitives";
import { MAP_PROVIDERS, type MapProviderId } from "@/lib/map-providers";
import { GEOCODE_PROVIDERS, type GeocodeProviderId } from "@/lib/geocode-providers";
import type { KeyValidation } from "@/hooks/use-google-api-key-validation";

type Props = {
  mapProvider: MapProviderId;
  geocodeProvider: GeocodeProviderId;
  hasKey: boolean;
  draft: string;
  reveal: boolean;
  keyValidation: KeyValidation;
  setMapProvider: (provider: MapProviderId) => void;
  setGeocodeProvider: (provider: GeocodeProviderId) => void;
  setReveal: (reveal: boolean | ((value: boolean) => boolean)) => void;
  updateKey: (value: string) => void;
  runKeyValidation: () => void;
};

export function SourcesSection({
  mapProvider,
  geocodeProvider,
  hasKey,
  draft,
  reveal,
  keyValidation,
  setMapProvider,
  setGeocodeProvider,
  setReveal,
  updateKey,
  runKeyValidation,
}: Props) {
  return (
    <Group icon={<Layers className="size-3.5" />} title="Sources">
      <Field label="Map provider">
        <Select value={mapProvider} onValueChange={(value) => setMapProvider(value as MapProviderId)}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(MAP_PROVIDERS).map(([id, provider]) => {
              const locked = provider.kind === "google" && !hasKey;
              return (
                <SelectItem key={id} value={id} disabled={locked}>
                  <span className="inline-flex items-center gap-2">
                    <span>{provider.name}</span>
                    {locked && <Lock className="size-3 opacity-60" />}
                  </span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Location provider">
        <Select
          value={geocodeProvider}
          onValueChange={(value) => setGeocodeProvider(value as GeocodeProviderId)}
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(GEOCODE_PROVIDERS).map(([id, provider]) => {
              const locked = provider.needsKey && !hasKey;
              return (
                <SelectItem key={id} value={id} disabled={locked}>
                  <span className="inline-flex items-center gap-2">
                    <span>{provider.name}</span>
                    {locked && <Lock className="size-3 opacity-60" />}
                  </span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Google Maps API key">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type={reveal ? "text" : "password"}
              placeholder="AIzaSy..."
              value={draft}
              onChange={(event) => updateKey(event.target.value)}
              onBlur={() => runKeyValidation()}
              className="h-9 pr-9"
            />
            <button
              type="button"
              onClick={() => setReveal((value) => !value)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {reveal ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            </button>
          </div>
        </div>
        <button
          onClick={() => openUrl("https://console.cloud.google.com/google/maps-apis/credentials")}
          className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
        >
          Get a key on Google Cloud
          <ExternalLink className="size-3" />
        </button>
        <KeyValidationMessage validation={keyValidation} />
      </Field>
    </Group>
  );
}
