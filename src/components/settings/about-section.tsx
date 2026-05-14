import { Check, Download, Info, Loader2, RotateCw, Sparkles } from "lucide-react";
import { openUrl } from "@tauri-apps/plugin-opener";

import { Button } from "@/components/ui/button";
import { Group, InfoRow } from "./settings-primitives";
import { VERSION } from "@/lib/links";
import type { UpdateInfo } from "@/lib/update-check";

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
  return (
    <Group icon={<Info className="size-3.5" />} title="About">
      <div className="space-y-2">
        <InfoRow label="Installed" value={`v${VERSION}`} />
        {updateInfo?.latest && (
          <InfoRow
            label="Latest"
            value={
              <span className="inline-flex items-center gap-1.5">
                v{updateInfo.latest}
                {updateInfo.hasUpdate ? (
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-400">
                    <Sparkles className="size-2.5" />
                    new
                  </span>
                ) : (
                  <Check className="size-3 text-muted-foreground" />
                )}
              </span>
            }
          />
        )}
        {updateError && (
          <div
            title={updateError}
            className="rounded border border-amber-500/20 bg-amber-500/10 px-2 py-1.5 text-[11px] text-amber-300"
          >
            Could not check for updates.
          </div>
        )}
        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            variant="outline"
            className="h-7 flex-1"
            onClick={runUpdateCheck}
            disabled={updateChecking}
          >
            {updateChecking ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <RotateCw className="size-3" />
            )}
            Check for updates
          </Button>
          {updateInfo?.hasUpdate && (
            <Button size="sm" className="h-7" onClick={() => openUrl(updateInfo.url)}>
              <Download className="size-3" />
              Get it
            </Button>
          )}
        </div>
      </div>
    </Group>
  );
}
