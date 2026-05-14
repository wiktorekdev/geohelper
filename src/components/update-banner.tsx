import { Download, ExternalLink, Loader2, RotateCw, X } from "lucide-react";
import { openUrl } from "@tauri-apps/plugin-opener";

import { useUpdateStore } from "@/lib/update-store";
import { Button } from "@/components/ui/button";

export function UpdateBanner() {
  const info = useUpdateStore((s) => s.updateInfo);
  const dismissed = useUpdateStore((s) => s.updateDismissed);
  const dismiss = useUpdateStore((s) => s.dismissUpdate);
  const install = useUpdateStore((s) => s.installUpdate);
  const installState = useUpdateStore((s) => s.installState);
  const installError = useUpdateStore((s) => s.installError);
  const downloaded = useUpdateStore((s) => s.downloadedBytes);
  const total = useUpdateStore((s) => s.totalBytes);
  const isInstalled = useUpdateStore((s) => s.isInstalled);

  if (!info?.hasUpdate) return null;
  if (info.latest === dismissed && installState === "idle") return null;

  const pct = total && total > 0 ? Math.min(100, Math.round((downloaded / total) * 100)) : null;
  // Treat null (unknown) as portable, so users who ship without the command
  // available still get the safe manual-download path.
  const canAutoInstall = isInstalled === true;

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
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {installState === "downloading" && (
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Downloading…</span>
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
          <Loader2 className="size-3 animate-spin" />
          Installing, relaunching…
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

      {installState === "idle" && canAutoInstall && (
        <Button
          variant="outline"
          size="sm"
          className="mt-2 h-7 w-full text-xs"
          onClick={() => install()}
        >
          <Download className="size-3" />
          Install & restart
        </Button>
      )}

      {installState === "idle" && !canAutoInstall && (
        <>
          <div className="mt-2 text-[10px] text-muted-foreground">
            Portable build - download and replace manually.
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-1 h-7 w-full text-xs"
            onClick={() => openUrl(info.url)}
          >
            <ExternalLink className="size-3" />
            Download v{info.latest}
          </Button>
        </>
      )}

      {installState === "error" && (
        <Button
          variant="outline"
          size="sm"
          className="mt-2 h-7 w-full text-xs"
          onClick={() => install()}
        >
          <RotateCw className="size-3" />
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
