import { useEffect } from "react";

import { useBridge } from "@/hooks/use-bridge";
import { useTheme } from "@/hooks/use-theme";
import { Sidebar } from "@/components/sidebar";
import { SettingsSidebar } from "@/components/settings-panel";
import { MapView } from "@/components/map-view";
import { EditToolbar } from "@/components/display/edit-toolbar";
import { useMapWindowLayout } from "@/hooks/use-map-window-layout";
import { useStore } from "@/lib/store";
import { useUpdateStore } from "@/lib/update-store";
import { useDisplayStore } from "@/lib/display-store";
import { ipc } from "@/lib/ipc";
import { logger } from "@/lib/logger";

export default function App() {
  useBridge();
  useTheme();

  const settingsOpen = useStore((s) => s.settingsOpen);
  const loadSecureSettings = useStore((s) => s.loadSecureSettings);
  const alwaysOnTop = useStore((s) => s.alwaysOnTop);
  const runUpdateCheck = useUpdateStore((s) => s.runUpdateCheck);
  const detectInstallKind = useUpdateStore((s) => s.detectInstallKind);

  const mapVisible = useDisplayStore((s) => s.mapVisible);

  useMapWindowLayout();

  useEffect(() => {
    runUpdateCheck();
    detectInstallKind();
    void loadSecureSettings();
  }, [runUpdateCheck, detectInstallKind, loadSecureSettings]);

  useEffect(() => {
    const t = setTimeout(() => {
      ipc.setAlwaysOnTop(alwaysOnTop).catch((e) => {
        logger.warn("setAlwaysOnTop failed:", e);
      });
    }, 50);
    return () => clearTimeout(t);
  }, [alwaysOnTop]);

  // Suppress the default webview context menu in release builds, but keep it
  // on inputs / textareas so users can still paste and use browser affordances
  // in places where it matters. Dev builds keep the menu so we can inspect.
  useEffect(() => {
    if (import.meta.env.DEV) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, [contenteditable='true']")) return;
      e.preventDefault();
    };
    document.addEventListener("contextmenu", handler);
    return () => document.removeEventListener("contextmenu", handler);
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {settingsOpen ? <SettingsSidebar fullWidth={!mapVisible} /> : <Sidebar fullWidth={!mapVisible} />}
      {mapVisible && (
        <main className="flex min-w-0 flex-1 flex-col">
          <MapView />
        </main>
      )}
      <EditToolbar />
    </div>
  );
}
