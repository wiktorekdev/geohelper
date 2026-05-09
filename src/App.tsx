import { useEffect } from "react";

import { useBridge } from "@/hooks/use-bridge";
import { useTheme } from "@/hooks/use-theme";
import { Sidebar } from "@/components/sidebar";
import { SettingsSidebar } from "@/components/settings-panel";
import { MapView } from "@/components/map-view";
import { useStore } from "@/lib/store";
import { ipc } from "@/lib/ipc";

export default function App() {
  useBridge();
  useTheme();

  const settingsOpen = useStore((s) => s.settingsOpen);
  const runUpdateCheck = useStore((s) => s.runUpdateCheck);
  const alwaysOnTop = useStore((s) => s.alwaysOnTop);

  useEffect(() => {
    runUpdateCheck();
  }, [runUpdateCheck]);

  useEffect(() => {
    // Small delay on first run to let Tauri attach the window.
    const t = setTimeout(() => {
      ipc.setAlwaysOnTop(alwaysOnTop).catch((e) => {
        console.warn("setAlwaysOnTop failed:", e);
      });
    }, 50);
    return () => clearTimeout(t);
  }, [alwaysOnTop]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {settingsOpen ? <SettingsSidebar /> : <Sidebar />}
      <main className="flex min-w-0 flex-1 flex-col">
        <MapView />
      </main>
    </div>
  );
}
