import { useEffect, useRef } from "react";
import { getCurrentWindow, LogicalSize } from "@tauri-apps/api/window";

import { SIDEBAR_WIDTH_PX, useDisplayStore } from "@/lib/display-store";

const MIN_WITH_MAP_W = 960;
const MIN_WITH_MAP_H = 640;
const MIN_MAP_HIDDEN_H = 400;
const SAVED_WIDTH_KEY = "geohelper.mapWindowWidth";

function loadSavedWidth(): number | null {
  const value = Number(localStorage.getItem(SAVED_WIDTH_KEY));
  return Number.isFinite(value) && value >= MIN_WITH_MAP_W ? value : null;
}

function saveWidth(width: number): void {
  if (Number.isFinite(width) && width >= MIN_WITH_MAP_W) {
    localStorage.setItem(SAVED_WIDTH_KEY, String(Math.round(width)));
  }
}

/**
 * Keep native resize constraints in sync with map visibility. The React layout fills the
 * window when the map is hidden, so we do not force-shrink the window anymore.
 */
export function useMapWindowLayout() {
  const mapVisible = useDisplayStore((s) => s.mapVisible);
  const firstRun = useRef(true);
  const savedInnerWidthRef = useRef<number | null>(loadSavedWidth());
  const resizeSeqRef = useRef(0);

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
        if (cancelled) return;

        const wLog = inner.width / scale;
        const hLog = inner.height / scale;

        if (!mapVisible) {
          if (wLog > SIDEBAR_WIDTH_PX + 12) {
            savedInnerWidthRef.current = wLog;
            saveWidth(wLog);
          }
          await win.setMinSize(new LogicalSize(SIDEBAR_WIDTH_PX, MIN_MAP_HIDDEN_H));
        } else {
          const restore = Math.max(MIN_WITH_MAP_W, savedInnerWidthRef.current ?? 1280);
          await win.setMinSize(new LogicalSize(MIN_WITH_MAP_W, MIN_WITH_MAP_H));
          if (cancelled || isStale()) return;
          if (wLog < MIN_WITH_MAP_W) {
            await win.setSize(new LogicalSize(restore, Math.max(MIN_WITH_MAP_H, hLog)));
          }
        }
      } catch {
        /* not running in Tauri webview */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mapVisible]);
}
