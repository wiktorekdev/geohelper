import { Check, Download, ExternalLink, Info, Loader2, RotateCw } from "lucide-react";
import { openUrl } from "@tauri-apps/plugin-opener";

import { Button } from "@/components/ui/button";
import { Group, InfoRow } from "./settings-primitives";
import { VERSION } from "@/lib/links";
import type { UpdateInfo } from "@/lib/update-check";
import { useUpdateStore } from "@/lib/update-store";
import { t } from "@/lib/i18n";

type Props = {
  updateInfo: UpdateInfo | null;
  updateChecking: boolean;
  updateError: string | null;
  runUpdateCheck: () => Promise<void>;
};

export function AboutSection({
  updateInfo,
  updateChecking,
  updateError,
  runUpdateCheck,
}: Props) {
  const installUpdate = useUpdateStore((s) => s.installUpdate);
  const installState = useUpdateStore((s) => s.installState);
  const installError = useUpdateStore((s) => s.installError);
  const downloaded = useUpdateStore((s) => s.downloadedBytes);
  const total = useUpdateStore((s) => s.totalBytes);
  const isInstalled = useUpdateStore((s) => s.isInstalled);

  const canAutoInstall = isInstalled === true;
  const pct =
    total && total > 0 ? Math.min(100, Math.round((downloaded / total) * 100)) : null;
  const showInstallFlow = Boolean(updateInfo?.hasUpdate);

  return (
    <Group icon={<Info className="size-3.5" />} title={t("settings.about.title")}>
      <div className="space-y-2">
        <InfoRow label={t("settings.about.installed")} value={`v${VERSION}`} />
        {updateInfo?.latest && (
          <InfoRow
            label={t("settings.about.latest")}
            value={
              <span className="inline-flex items-center gap-1.5">
                v{updateInfo.latest}
                {!updateInfo.hasUpdate && <Check className="size-3 text-muted-foreground" />}
              </span>
            }
          />
        )}
        {updateError && (
          <div
            title={updateError}
            className="rounded border border-amber-500/20 bg-amber-500/10 px-2 py-1.5 text-[11px] text-amber-300"
          >
            {t("settings.about.checkFailed")}
          </div>
        )}

        {showInstallFlow && installState === "downloading" && (
          <div className="space-y-1 rounded border border-sidebar-border bg-background/40 px-2 py-1.5">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>{t("settings.about.downloading")}</span>
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

        {showInstallFlow && installState === "installing" && (
          <div className="flex items-center gap-1.5 rounded border border-sidebar-border bg-background/40 px-2 py-1.5 text-[11px] text-muted-foreground">
            <Loader2 className="size-3 animate-spin" />
            {t("settings.about.installing")}
          </div>
        )}

        {showInstallFlow && installState === "error" && updateInfo && (
          <div className="space-y-1.5 rounded border border-amber-500/20 bg-amber-500/10 px-2 py-1.5 text-[10px] text-amber-300">
            <div>
              {installError || t("settings.about.updateFailed")}.{" "}
              <button
                type="button"
                onClick={() => void openUrl(updateInfo.url)}
                className="underline underline-offset-2 hover:text-amber-200"
              >
                {t("settings.about.downloadManually")}
              </button>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-full text-xs"
              onClick={() => void installUpdate()}
            >
              <RotateCw className="size-3" />
              {t("settings.about.tryAgain")}
            </Button>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            variant="outline"
            className="h-7 flex-1"
            onClick={runUpdateCheck}
            disabled={updateChecking || installState === "downloading" || installState === "installing"}
          >
            {updateChecking ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <RotateCw className="size-3" />
            )}
            {t("settings.about.checkUpdates")}
          </Button>
          {updateInfo?.hasUpdate && installState === "idle" && canAutoInstall && (
            <Button size="sm" className="h-7 shrink-0" onClick={() => void installUpdate()}>
              <Download className="size-3" />
              {t("settings.about.installRestart")}
            </Button>
          )}
          {updateInfo?.hasUpdate && installState === "idle" && !canAutoInstall && (
            <Button size="sm" className="h-7 shrink-0" onClick={() => void openUrl(updateInfo.url)}>
              <ExternalLink className="size-3" />
              {t("settings.about.downloadVersion", { version: updateInfo.latest })}
            </Button>
          )}
        </div>
      </div>
    </Group>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
