import { m, AnimatePresence } from "framer-motion";
import { Download, ExternalLink, Loader2, RotateCw, Sparkles, X } from "lucide-react";
import { openUrl } from "@tauri-apps/plugin-opener";

import { useUpdateStore } from "@/lib/update-store";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";

export function UpdateBanner() {
  const t = useT();
  const info = useUpdateStore((s) => s.updateInfo);
  const dismissed = useUpdateStore((s) => s.updateDismissed);
  const dismiss = useUpdateStore((s) => s.dismissUpdate);
  const install = useUpdateStore((s) => s.installUpdate);
  const installState = useUpdateStore((s) => s.installState);
  const installError = useUpdateStore((s) => s.installError);
  const downloaded = useUpdateStore((s) => s.downloadedBytes);
  const total = useUpdateStore((s) => s.totalBytes);
  const isInstalled = useUpdateStore((s) => s.isInstalled);

  const visible = !!(
    info?.hasUpdate &&
    (info.latest !== dismissed || installState !== "idle")
  );

  const pct = total && total > 0 ? Math.min(100, Math.round((downloaded / total) * 100)) : null;
  // Treat null (unknown) as portable, so users who ship without the command
  // available still get the safe manual-download path.
  const canAutoInstall = isInstalled === true;

  return (
    <AnimatePresence>
      {visible && (
        <m.div
          initial={{ opacity: 0, height: 0, scale: 0.95, marginBottom: 0 }}
          animate={{ opacity: 1, height: "auto", scale: 1, marginBottom: 8 }}
          exit={{ opacity: 0, height: 0, scale: 0.95, marginBottom: 0 }}
          transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
          className="relative mx-3 overflow-hidden rounded-lg border border-sidebar-border bg-gradient-to-br from-background/80 via-background/60 to-brand/[0.04] shadow-sm"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent"
          />

          <div className="px-3 pt-2.5 pb-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-start gap-2">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-brand/15 text-brand">
                  <Sparkles className="size-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold leading-tight">
                    {t("update.available")}
                  </div>
                  <div className="truncate text-[11px] text-muted-foreground">
                    {t("update.versionOut", { version: info.latest })}
                  </div>
                </div>
              </div>
              {installState === "idle" && (
                <button
                  onClick={dismiss}
                  title={t("update.dismiss")}
                  className="-mr-1 -mt-1 inline-flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {installState === "downloading" && (
              <div className="mt-2.5 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Loader2 className="size-3 animate-spin" />
                    {t("update.downloading")}
                  </span>
                  <span className="font-mono tabular-nums text-foreground/80">
                    {pct !== null ? `${pct}%` : formatBytes(downloaded)}
                  </span>
                </div>
                <div className="relative h-1.5 overflow-hidden rounded-full bg-accent/50">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand to-emerald-500 transition-[width] duration-200"
                    style={{ width: pct !== null ? `${pct}%` : "40%" }}
                  />
                  {pct === null && (
                    <div className="absolute inset-y-0 -left-1/3 w-1/3 animate-[shimmer_1.4s_ease-in-out_infinite] rounded-full bg-white/20 blur-sm" />
                  )}
                </div>
              </div>
            )}

            {installState === "installing" && (
              <div className="mt-2.5 flex items-center gap-1.5 rounded-md border border-sidebar-border bg-background/40 px-2 py-1.5 text-[11px] text-muted-foreground">
                <Loader2 className="size-3 animate-spin text-brand" />
                {t("update.installing")}
              </div>
            )}

            {installState === "error" && (
              <div className="mt-2.5 rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-1.5 text-[11px] text-amber-300">
                <div className="font-medium">{installError || t("update.failed")}</div>
                <button
                  onClick={() => openUrl(info.url)}
                  className="mt-0.5 inline-flex items-center gap-1 text-[10px] underline underline-offset-2 hover:text-amber-200"
                >
                  {t("update.downloadManually")}
                  <ExternalLink className="size-2.5" />
                </button>
              </div>
            )}

            {installState === "idle" && canAutoInstall && (
              <Button
                size="sm"
                className="mt-2.5 h-8 w-full gap-1.5 text-xs"
                onClick={() => install()}
              >
                <Download className="size-3.5" />
                {t("update.installRestart")}
              </Button>
            )}

            {installState === "idle" && !canAutoInstall && (
              <>
                <div className="mt-2 text-[10px] text-muted-foreground">
                  {t("update.portableBuild")}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-1.5 h-8 w-full gap-1.5 text-xs"
                  onClick={() => openUrl(info.url)}
                >
                  <ExternalLink className="size-3.5" />
                  {t("update.downloadVersion", { version: info.latest })}
                </Button>
              </>
            )}

            {installState === "error" && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2 h-8 w-full gap-1.5 text-xs"
                onClick={() => install()}
              >
                <RotateCw className="size-3.5" />
                {t("update.tryAgain")}
              </Button>
            )}
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
