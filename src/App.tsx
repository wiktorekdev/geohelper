import { useEffect } from "react";

import { useBridge } from "@/hooks/use-bridge";
import { useTheme } from "@/hooks/use-theme";
import { Sidebar } from "@/components/sidebar";
import { SettingsSidebar } from "@/components/settings-panel";
import { MapView } from "@/components/map-view";
import { EditToolbar } from "@/components/display/edit-toolbar";
import { useStore } from "@/lib/store";
import { useDisplayStore } from "@/lib/display-store";
import { ipc } from "@/lib/ipc";

export default function App() {
  useBridge();
  useTheme();

  const settingsOpen = useStore((s) => s.settingsOpen);
  const runUpdateCheck = useStore((s) => s.runUpdateCheck);
  const detectInstallKind = useStore((s) => s.detectInstallKind);
  const alwaysOnTop = useStore((s) => s.alwaysOnTop);

  const mapVisible = useDisplayStore((s) => s.mapVisible);

  useEffect(() => {
    runUpdateCheck();
    detectInstallKind();
  }, [runUpdateCheck, detectInstallKind]);

  useEffect(() => {
    const t = setTimeout(() => {
      ipc.setAlwaysOnTop(alwaysOnTop).catch((e) => {
        console.warn("setAlwaysOnTop failed:", e);
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
      {settingsOpen ? <SettingsSidebar /> : <Sidebar />}
      {mapVisible && (
        <main className="flex min-w-0 flex-1 flex-col">
          <MapView />
        </main>
      )}
      <EditToolbar />
    </div>
  );
}
