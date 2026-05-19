import { useEffect } from "react";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";

import { useBridge } from "@/hooks/use-bridge";
import { useTheme } from "@/hooks/use-theme";
import { Sidebar } from "@/components/sidebar";
import { SettingsSidebar } from "@/components/settings-panel";
import { MapView } from "@/components/map-view";
import { EditToolbar } from "@/components/display/edit-toolbar";
import { SelectionToolbar } from "@/components/display/selection-toolbar";
import { useMapWindowLayout } from "@/hooks/use-map-window-layout";
import { useStore } from "@/lib/store";
import { useUpdateStore } from "@/lib/update-store";
import { useDisplayStore } from "@/lib/display-store";
import { useI18n } from "@/lib/i18n";
import { useThemeStore } from "@/lib/themes/store";
import { migrateLegacyStorage } from "@/lib/settings-persistence";
import { ipc } from "@/lib/ipc";
import { logger } from "@/lib/logger";

export default function App() {
  useBridge();
  useTheme();

  const settingsOpen = useStore((s) => s.settingsOpen);
  const hydrateSettings = useStore((s) => s.hydrateSettings);
  const alwaysOnTop = useStore((s) => s.alwaysOnTop);
  const runUpdateCheck = useUpdateStore((s) => s.runUpdateCheck);
  const detectInstallKind = useUpdateStore((s) => s.detectInstallKind);
  const hydrateUpdate = useUpdateStore((s) => s.hydrate);

  const mapVisible = useDisplayStore((s) => s.mapVisible);
  const hydrateDisplay = useDisplayStore((s) => s.hydrate);

  useMapWindowLayout();

  useEffect(() => {
    void (async () => {
      try {
        // 1. Perform automatic migration from legacy localStorage/themes.json
        await migrateLegacyStorage();

        // 2. Hydrate all stores concurrently from settings.json
        await Promise.all([
          hydrateSettings(),
          hydrateDisplay(),
          useI18n.getState().hydrate(),
          useThemeStore.getState().hydrate(),
          hydrateUpdate(),
        ]);

        // 3. Trigger initial updates and checks
        void runUpdateCheck();
        void detectInstallKind();
      } catch (e) {
        logger.error("Failed startup store migration and hydration:", e);
      }
    })();
  }, [hydrateSettings, hydrateDisplay, hydrateUpdate, runUpdateCheck, detectInstallKind]);

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
    <LazyMotion features={domAnimation}>
      <div className="flex h-screen w-screen overflow-hidden bg-background">
        {settingsOpen ? <SettingsSidebar /> : <Sidebar />}
        
        <AnimatePresence mode="popLayout" initial={false}>
          {mapVisible && (
            <m.main
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
              className="relative flex flex-1 min-w-0 flex-col overflow-hidden"
            >
              <MapView />
              <EditToolbar />
            </m.main>
          )}
        </AnimatePresence>
        
        {!mapVisible && <EditToolbar />}
        <SelectionToolbar />
      </div>
    </LazyMotion>
  );
}
