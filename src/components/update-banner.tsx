import { Download, Loader2, RotateCw, X } from "lucide-react";
import { openUrl } from "@tauri-apps/plugin-opener";

import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

export function UpdateBanner() {
  const info = useStore((s) => s.updateInfo);
  const dismissed = useStore((s) => s.updateDismissed);
  const dismiss = useStore((s) => s.dismissUpdate);
  const install = useStore((s) => s.installUpdate);
  const installState = useStore((s) => s.installState);
  const installError = useStore((s) => s.installError);
  const downloaded = useStore((s) => s.downloadedBytes);
  const total = useStore((s) => s.totalBytes);

  if (!info?.hasUpdate) return null;
  if (info.latest === dismissed && installState === "idle") return null;

  const pct = total && total > 0 ? Math.min(100, Math.round((downloaded / total) * 100)) : null;

  return (
    <div className="mx-3 mb-2 rounded-md border border-sidebar-border bg-background/60 px-3 py-2 text-xs">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-medium">Update available</div>
          <div className="text-muted-foreground truncate">v{info.latest} is out</div>
        </div>
        {installState === "idle" && (
          <button
            onClick={dismiss}
            title="Dismiss"
            className="text-muted-foreground hover:text-foreground shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {installState === "downloading" && (
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Downloading...</span>
            <span className="font-mono tabular-nums">
              {pct !== null ? `${pct}%` : formatBytes(downloaded)}
            </span>
          </div>
          <div className="h-1 overflow-hidden rounded bg-accent">
            <div
              className="h-full bg-emerald-500 transition-[width] duration-200"
              style={{ width: pct !== null ? `${pct}%` : "40%" }}
            />
          </div>
        </div>
      )}

      {installState === "installing" && (
        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          Installing, relaunching...
        </div>
      )}

      {installState === "error" && (
        <div className="mt-2 rounded border border-amber-500/20 bg-amber-500/10 p-1.5 text-[10px] text-amber-300">
          {installError || "Update failed"}.{" "}
          <button
            onClick={() => openUrl(info.url)}
            className="underline underline-offset-2 hover:text-amber-200"
          >
            Download manually
          </button>
        </div>
      )}

      {installState === "idle" && (
        <Button
          variant="outline"
          size="sm"
          className="mt-2 h-7 w-full text-xs"
          onClick={() => install()}
        >
          <Download className="h-3 w-3" />
          Install & restart
        </Button>
      )}

      {installState === "error" && (
        <Button
          variant="outline"
          size="sm"
          className="mt-2 h-7 w-full text-xs"
          onClick={() => install()}
        >
          <RotateCw className="h-3 w-3" />
          Try again
        </Button>
      )}
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
