import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { openUrl } from "@tauri-apps/plugin-opener";

import { AboutSection } from "@/components/settings/about-section";
import { AppearanceSection } from "@/components/settings/appearance-section";
import { Divider, SocialIcon } from "@/components/settings/settings-primitives";
import { SourcesSection } from "@/components/settings/sources-section";
import { GithubIcon, KofiIcon } from "@/components/brand-icons";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGoogleApiKeyValidation } from "@/hooks/use-google-api-key-validation";
import { GITHUB_URL, KOFI_URL } from "@/lib/links";
import { useDisplayStore } from "@/lib/display-store";
import { useStore } from "@/lib/store";
import { useUpdateStore } from "@/lib/update-store";
import { useT } from "@/lib/i18n";

export function SettingsSidebar() {
  const t = useT();
  const close = useStore((s) => s.closeSettings);
  const sidebarWidth = useDisplayStore((s) => s.sidebarWidth);

  const mapProvider = useStore((s) => s.mapProvider);
  const setMapProvider = useStore((s) => s.setMapProvider);
  const geocodeProvider = useStore((s) => s.geocodeProvider);
  const setGeocodeProvider = useStore((s) => s.setGeocodeProvider);

  const apiKey = useStore((s) => s.googleApiKey);
  const setApiKey = useStore((s) => s.setGoogleApiKey);
  const alwaysOnTop = useStore((s) => s.alwaysOnTop);
  const setAlwaysOnTop = useStore((s) => s.setAlwaysOnTop);

  const updateInfo = useUpdateStore((s) => s.updateInfo);

  const updateChecking = useUpdateStore((s) => s.updateChecking);
  const updateError = useUpdateStore((s) => s.updateError);
  const runUpdateCheck = useUpdateStore((s) => s.runUpdateCheck);

  const [draft, setDraft] = useState(apiKey);
  const [reveal, setReveal] = useState(false);
  const { validation: keyValidation, validate: runKeyValidation } =
    useGoogleApiKeyValidation(draft);

  const hasKey = apiKey.trim().length > 0;

  useEffect(() => {
    setDraft(apiKey);
  }, [apiKey]);

  function updateKey(value: string) {
    setDraft(value);
    const trimmed = value.trim();
    setApiKey(trimmed);
    if (!trimmed) {
      if (mapProvider.startsWith("google-")) setMapProvider("osm");
      if (geocodeProvider === "google") setGeocodeProvider("nominatim");
    }
  }

  return (
    <aside className="flex h-full shrink-0 flex-col border-r border-sidebar-border bg-sidebar" style={{ width: sidebarWidth }}>
      <header className="flex items-center gap-2 p-3">
        <Button size="icon" variant="ghost" className="size-8" onClick={close}>
          <ArrowLeft className="size-4" />
        </Button>
        <div className="text-[15px] font-semibold tracking-tight">{t("settings.title")}</div>
      </header>

      <ScrollArea className="flex-1">
        <SourcesSection
          mapProvider={mapProvider}
          geocodeProvider={geocodeProvider}
          hasKey={hasKey}
          draft={draft}
          reveal={reveal}
          keyValidation={keyValidation}
          setMapProvider={setMapProvider}
          setGeocodeProvider={setGeocodeProvider}
          setReveal={setReveal}
          updateKey={updateKey}
          runKeyValidation={runKeyValidation}
        />
        <Divider />
        <AppearanceSection
          alwaysOnTop={alwaysOnTop}
          setAlwaysOnTop={setAlwaysOnTop}
        />
        <Divider />
        <AboutSection
          updateInfo={updateInfo}
          updateChecking={updateChecking}
          updateError={updateError}
          runUpdateCheck={runUpdateCheck}
        />
      </ScrollArea>

      <footer className="flex items-center justify-center gap-1 border-t border-sidebar-border px-4 py-3">
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
