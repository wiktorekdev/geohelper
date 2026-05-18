import { useEffect, useRef } from "react";
import { getCurrentWindow, LogicalSize } from "@tauri-apps/api/window";

import { useDisplayStore } from "@/lib/display-store";

const MIN_WITH_MAP_W = 960;
const MIN_WITH_MAP_H = 640;
const MIN_MAP_HIDDEN_H = 400;

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

  useEffect(() => {
    const seq = ++resizeSeqRef.current;
    const isStale = () => seq !== resizeSeqRef.current;

    if (firstRun.current) {
      firstRun.current = false;
      if (mapVisible) return;
    }

    let cancelled = false;
    let timeout = 0;

    void (async () => {
      try {
        const win = getCurrentWindow();
        if ((await win.isFullscreen()) || (await win.isMaximized())) return;

        const inner = await win.innerSize();
        const scale = await win.scaleFactor();
        if (cancelled) return;

        const hLog = inner.height / scale;
        const wLog = inner.width / scale;

        if (!mapVisible) {
          await win.setMinSize(new LogicalSize(sidebarWidth, MIN_MAP_HIDDEN_H));
          if (cancelled || isStale()) return;
          await win.setSize(new LogicalSize(sidebarWidth, Math.max(MIN_MAP_HIDDEN_H, hLog)));
        } else {
          await win.setMinSize(new LogicalSize(MIN_WITH_MAP_W, MIN_WITH_MAP_H));
          if (cancelled || isStale()) return;
          // If the window is currently sidebar-narrow (we just unhid the map),
          // grow it back so the map area has room without the user having to drag.
          // Delay slightly so the CSS mount animation finishes before the window grows,
          // avoiding the visual jump at the end of the transition.
          const needsResize = wLog < MIN_WITH_MAP_W || hLog < MIN_WITH_MAP_H;
          if (needsResize) {
            timeout = window.setTimeout(async () => {
              if (cancelled || isStale()) return;
              await win.setSize(
                new LogicalSize(
                  Math.max(MIN_WITH_MAP_W, wLog),
                  Math.max(MIN_WITH_MAP_H, hLog),
                ),
              );
            }, 300);
          }
        }
      } catch {
        /* not running in Tauri webview */
      }
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [mapVisible, sidebarWidth]);
}
