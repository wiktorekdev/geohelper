import { Download, X } from "lucide-react";
import { openUrl } from "@tauri-apps/plugin-opener";

import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

export function UpdateBanner() {
  const info = useStore((s) => s.updateInfo);
  const dismissed = useStore((s) => s.updateDismissed);
  const dismiss = useStore((s) => s.dismissUpdate);

  if (!info?.hasUpdate) return null;
  if (info.latest === dismissed) return null;

  return (
    <div className="mx-3 mb-2 rounded-md border border-sidebar-border bg-background/60 px-3 py-2 text-xs">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-medium">Update available</div>
          <div className="text-muted-foreground truncate">v{info.latest} is out</div>
        </div>
        <button
          onClick={dismiss}
          title="Dismiss"
          className="text-muted-foreground hover:text-foreground shrink-0"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="mt-2 h-7 w-full text-xs"
        onClick={() => openUrl(info.url)}
      >
        <Download className="h-3 w-3" />
        Download
      </Button>
    </div>
  );
}
