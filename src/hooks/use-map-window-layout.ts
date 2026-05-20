import { useEffect, useRef } from "react";
import { getCurrentWindow, LogicalSize } from "@tauri-apps/api/window";

import { useDisplayStore } from "@/lib/display-store";
import { getSettingsStore, saveSetting } from "@/lib/settings-persistence";

const MIN_WITH_MAP_W = 960;
const MIN_WITH_MAP_H = 640;
const MIN_MAP_HIDDEN_H = 550;

/**
 * Keep native resize constraints in sync with map visibility. The sidebar is the stable
 * surface; hiding the map collapses the native window to the sidebar width, and showing
 * the map lets the map fill the remaining space.
 */
export function useMapWindowLayout() {
  const mapVisible = useDisplayStore((s) => s.mapVisible);
  const sidebarWidth = useDisplayStore((s) => s.sidebarWidth);
  const firstRun = useRef(true);
  const resizeSeqRef = useRef(0);

  // Track and save the custom window width resized by the user while the map is visible
  useEffect(() => {
    if (!mapVisible) return;

    let timeoutId = 0;
    const handleResize = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(async () => {
        try {
          const win = getCurrentWindow();
          if ((await win.isFullscreen()) || (await win.isMaximized())) return;
          const inner = await win.innerSize();
          const scale = await win.scaleFactor();
          const wLog = inner.width / scale;
          if (wLog >= MIN_WITH_MAP_W) {
            void saveSetting("lastWindowWidth", Math.round(wLog));
          }
        } catch {
          /* not running in Tauri webview */
        }
      }, 150);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.clearTimeout(timeoutId);
    };
  }, [mapVisible]);

  useEffect(() => {
    const seq = ++resizeSeqRef.current;
    const isStale = () => seq !== resizeSeqRef.current;

    if (firstRun.current) {
      firstRun.current = false;
      if (mapVisible) return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const win = getCurrentWindow();
        if ((await win.isFullscreen()) || (await win.isMaximized())) return;

        const inner = await win.innerSize();
        const scale = await win.scaleFactor();
        if (cancelled || isStale()) return;

        const hLog = inner.height / scale;
        const wLog = inner.width / scale;

        if (!mapVisible) {
          await win.setMinSize(new LogicalSize(sidebarWidth, MIN_MAP_HIDDEN_H));
          if (cancelled || isStale()) return;
          await win.setSize(new LogicalSize(sidebarWidth, Math.max(MIN_MAP_HIDDEN_H, hLog)));
        } else {
          await win.setMinSize(new LogicalSize(MIN_WITH_MAP_W, MIN_WITH_MAP_H));
          if (cancelled || isStale()) return;

          // Retrieve last stored window width or default to MIN_WITH_MAP_W
          const store = await getSettingsStore();
          const storedWidth = await store.get<number>("lastWindowWidth");
          if (cancelled || isStale()) return;

          const targetWidth = storedWidth 
            ? Math.max(MIN_WITH_MAP_W, storedWidth) 
            : MIN_WITH_MAP_W;

          // Resize immediately to allow the CSS/Motion transition to fill the space.
          const needsResize = wLog < targetWidth || hLog < MIN_WITH_MAP_H;
          if (needsResize) {
            await win.setSize(
              new LogicalSize(
                Math.max(targetWidth, wLog),
                Math.max(MIN_WITH_MAP_H, hLog),
              ),
            );
          }
        }
      } catch {
        /* not running in Tauri webview */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mapVisible, sidebarWidth]);
}
