import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  Info,
  Layers,
  Loader2,
  Lock,
  Palette,
  RotateCw,
  Sparkles,
} from "lucide-react";
import { openUrl } from "@tauri-apps/plugin-opener";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MAP_PROVIDERS, type MapProviderId } from "@/lib/map-providers";
import { GEOCODE_PROVIDERS, type GeocodeProviderId } from "@/lib/geocode-providers";
import { useStore, type CopyFormat } from "@/lib/store";
import { ipc } from "@/lib/ipc";
import { cn } from "@/lib/utils";
import { GITHUB_URL, KOFI_URL, VERSION } from "@/lib/links";
import { GithubIcon, KofiIcon } from "@/components/brand-icons";
import { validateGoogleApiKey } from "@/lib/google-api-key";

type KeyValidation =
  | { state: "idle"; message: string | null }
  | { state: "checking"; message: string | null }
  | { state: "valid"; message: string }
  | { state: "invalid"; message: string };

export function SettingsSidebar() {
  const close = useStore((s) => s.closeSettings);

  const provider = useStore((s) => s.provider);
  const setProvider = useStore((s) => s.setProvider);
  const geocodeProvider = useStore((s) => s.geocodeProvider);
  const setGeocodeProvider = useStore((s) => s.setGeocodeProvider);

  const apiKey = useStore((s) => s.googleApiKey);
  const setApiKey = useStore((s) => s.setGoogleApiKey);

  const copyFormat = useStore((s) => s.copyFormat);
  const setCopyFormat = useStore((s) => s.setCopyFormat);
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const alwaysOnTop = useStore((s) => s.alwaysOnTop);
  const setAlwaysOnTop = useStore((s) => s.setAlwaysOnTop);

  const updateInfo = useStore((s) => s.updateInfo);
  const updateChecking = useStore((s) => s.updateChecking);
  const updateError = useStore((s) => s.updateError);
  const runUpdateCheck = useStore((s) => s.runUpdateCheck);

  const [draft, setDraft] = useState(apiKey);
  const [reveal, setReveal] = useState(false);
  const [keyValidation, setKeyValidation] = useState<KeyValidation>(() =>
    apiKey.trim()
      ? { state: "idle", message: null }
      : { state: "invalid", message: "Google Maps API key is required." },
  );
  const validationAbort = useRef<AbortController | null>(null);
  const validationSeq = useRef(0);

  const hasKey = apiKey.trim().length > 0;

  useEffect(() => {
    setDraft(apiKey);
  }, [apiKey]);

  useEffect(() => {
    const key = draft.trim();
    validationAbort.current?.abort();

    if (!key) {
      setKeyValidation({ state: "invalid", message: "Google Maps API key is required." });
      return;
    }

    setKeyValidation({ state: "idle", message: "Waiting to validate..." });
    const t = window.setTimeout(() => {
      void runKeyValidation(key);
    }, 700);

    return () => {
      window.clearTimeout(t);
      validationAbort.current?.abort();
    };
  }, [draft]);

  function updateKey(value: string) {
    setDraft(value);
    const trimmed = value.trim();
    setApiKey(trimmed);
    if (!trimmed) {
      if (provider.startsWith("google-")) setProvider("osm");
      if (geocodeProvider === "google") setGeocodeProvider("nominatim");
    }
  }

  async function runKeyValidation(key = draft.trim()) {
    validationAbort.current?.abort();
    if (!key) {
      setKeyValidation({ state: "invalid", message: "Google Maps API key is required." });
      return;
    }

    const seq = ++validationSeq.current;
    const controller = new AbortController();
    validationAbort.current = controller;
    setKeyValidation({ state: "checking", message: "Checking Google API key..." });

    try {
      const result = await validateGoogleApiKey(key, controller.signal);
      if (seq !== validationSeq.current) return;
      setKeyValidation({
        state: result.ok ? "valid" : "invalid",
        message: result.message,
      });
    } catch (e) {
      if (controller.signal.aborted || seq !== validationSeq.current) return;
      setKeyValidation({
        state: "invalid",
        message: e instanceof Error ? e.message : "Could not validate Google API key.",
      });
    }
  }

  async function toggleAlwaysOnTop(v: boolean) {
    const previous = alwaysOnTop;
    setAlwaysOnTop(v);
    try {
      await ipc.setAlwaysOnTop(v);
    } catch (e) {
      setAlwaysOnTop(previous);
      console.warn("setAlwaysOnTop failed:", e);
    }
  }

  return (
    <aside className="flex h-full w-[320px] shrink-0 flex-col bg-sidebar border-r border-sidebar-border">
      <header className="flex items-center gap-2 p-3">
        <Button size="icon" variant="ghost" className="size-8" onClick={close}>
          <ArrowLeft className="size-4" />
        </Button>
        <div className="text-[15px] font-semibold tracking-tight">Settings</div>
      </header>

      <ScrollArea className="flex-1">
        <Group icon={<Layers className="size-3.5" />} title="Sources">
          <Field label="Map provider">
            <Select value={provider} onValueChange={(v) => setProvider(v as MapProviderId)}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(MAP_PROVIDERS).map(([id, p]) => {
                  const locked = p.kind === "google" && !hasKey;
                  return (
                    <SelectItem key={id} value={id} disabled={locked}>
                      <span className="inline-flex items-center gap-2">
                        <span>{p.name}</span>
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
              onValueChange={(v) => setGeocodeProvider(v as GeocodeProviderId)}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(GEOCODE_PROVIDERS).map(([id, p]) => {
                  const locked = p.needsKey && !hasKey;
                  return (
                    <SelectItem key={id} value={id} disabled={locked}>
                      <span className="inline-flex items-center gap-2">
                        <span>{p.name}</span>
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
                  onChange={(e) => updateKey(e.target.value)}
                  onBlur={() => void runKeyValidation()}
                  className="pr-9 h-9"
                />
                <button
                  type="button"
                  onClick={() => setReveal((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {reveal ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </button>
              </div>
            </div>
            <button
              onClick={() =>
                openUrl("https://console.cloud.google.com/google/maps-apis/credentials")
              }
              className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
            >
              Get a key on Google Cloud
              <ExternalLink className="size-3" />
            </button>
            <KeyValidationMessage validation={keyValidation} />
          </Field>
        </Group>

        <Divider />

        <Group icon={<Palette className="size-3.5" />} title="Appearance">
          <Field label="Theme">
            <div className="grid grid-cols-2 gap-2">
              <ThemeButton active={theme === "dark"} onClick={() => setTheme("dark")}>
                Dark
              </ThemeButton>
              <ThemeButton active={theme === "light"} onClick={() => setTheme("light")}>
                Light
              </ThemeButton>
            </div>
          </Field>

          <div className="flex items-center justify-between gap-2 text-sm pt-1">
            <span>Always on top</span>
            <Switch
              checked={alwaysOnTop}
              onCheckedChange={(v) => void toggleAlwaysOnTop(v)}
              aria-label="Toggle always on top"
            />
          </div>

          <Field label="Copy format">
            <Select value={copyFormat} onValueChange={(v) => setCopyFormat(v as CopyFormat)}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lat, lng">lat, lng</SelectItem>
                <SelectItem value="lat,lng">lat,lng</SelectItem>
                <SelectItem value="lng,lat">lng,lat</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </Group>

        <Divider />

        <Group icon={<Info className="size-3.5" />} title="About">
          <div className="space-y-2">
            <InfoRow label="Installed" value={`v${VERSION}`} />
            {updateInfo?.latest && (
              <InfoRow
                label="Latest"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    v{updateInfo.latest}
                    {updateInfo.hasUpdate ? (
                      <span className="inline-flex items-center gap-1 text-[10px] rounded bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5">
                        <Sparkles className="size-2.5" />
                        new
                      </span>
                    ) : (
                      <Check className="size-3 text-muted-foreground" />
                    )}
                  </span>
                }
              />
            )}
            {updateError && (
              <div
                title={updateError}
                className="rounded border border-amber-500/20 bg-amber-500/10 px-2 py-1.5 text-[11px] text-amber-300"
              >
                Could not check for updates.
              </div>
            )}
            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-7"
                onClick={runUpdateCheck}
                disabled={updateChecking}
              >
                {updateChecking ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <RotateCw className="size-3" />
                )}
                Check for updates
              </Button>
              {updateInfo?.hasUpdate && (
                <Button size="sm" className="h-7" onClick={() => openUrl(updateInfo.url)}>
                  <Download className="size-3" />
                  Get it
                </Button>
              )}
            </div>
          </div>
        </Group>
      </ScrollArea>

      <footer className="flex items-center justify-center gap-1 px-4 py-3 border-t border-sidebar-border">
        <SocialIcon title="GitHub" onClick={() => openUrl(GITHUB_URL)}>
          <GithubIcon className="size-4" />
        </SocialIcon>
        <SocialIcon title="Ko-fi" onClick={() => openUrl(KOFI_URL)}>
          <KofiIcon className="size-4" />
        </SocialIcon>
      </footer>
    </aside>
  );
}

function KeyValidationMessage({ validation }: { validation: KeyValidation }) {
  if (!validation.message) return null;

  return (
    <div
      className={cn(
        "mt-1.5 inline-flex items-start gap-1.5 text-[11px]",
        validation.state === "valid" && "text-emerald-400",
        validation.state === "invalid" && "text-amber-300",
        validation.state !== "valid" && validation.state !== "invalid" && "text-muted-foreground",
      )}
    >
      {validation.state === "checking" && <Loader2 className="mt-0.5 size-3 animate-spin" />}
      {validation.state === "valid" && <Check className="mt-0.5 size-3" />}
      {validation.state === "invalid" && <AlertTriangle className="mt-0.5 size-3" />}
      <span>{validation.message}</span>
    </div>
  );
}

function Group({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="px-5 py-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
        <span className="text-muted-foreground">{icon}</span>
        {title}
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="text-[11px] font-medium text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-sidebar-border mx-4" />;
}

function ThemeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-9 rounded-md border text-sm transition-colors",
        active
          ? "border-foreground/20 bg-accent text-foreground"
          : "border-border text-muted-foreground hover:bg-accent/60",
      )}
    >
      {children}
    </button>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono truncate">{value}</span>
    </div>
  );
}

function SocialIcon({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="size-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
    >
      {children}
    </button>
  );
}
