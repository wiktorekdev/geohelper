import { useEffect, useState } from "react"
import type { MouseEvent } from "react"
import { ChevronRight, Sparkles, X } from "lucide-react"
import { AnimatePresence, m } from "motion/react"

import { useWhatsNewStore } from "@/lib/whats-new-store"
import { useStore } from "@/lib/store"
import { useT } from "@/lib/i18n"

export function ChangelogModal() {
  const t = useT()
  const { versions, hasUnread, fetchChangelog, markAsRead, setSelectedVersion } =
    useWhatsNewStore()
  const openChangelog = useStore((s) => s.openChangelog)
  const [dismissed, setDismissed] = useState(false)

  const latestVersion = versions[0]

  useEffect(() => {
    void fetchChangelog()
  }, [fetchChangelog])

  const handleDismiss = (e?: MouseEvent) => {
    if (e) e.stopPropagation()
    if (latestVersion) {
      localStorage.setItem("geohelper_acknowledged_version", latestVersion.version)
    }
    markAsRead()
    setDismissed(true)
  }

  const handleOpenDetails = () => {
    if (latestVersion) {
      setSelectedVersion(latestVersion, true)
    }
    markAsRead()
    setDismissed(true)
    openChangelog()
  }

  const visible = (hasUnread || import.meta.env.DEV) && !dismissed && !!latestVersion

  return (
    <AnimatePresence>
      {visible && (
        <m.div
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.96 }}
          transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
          onClick={handleOpenDetails}
          className="absolute inset-x-3 bottom-[64px] z-40 cursor-pointer overflow-hidden rounded-lg border border-sidebar-border bg-gradient-to-br from-background/90 via-background/75 to-amber-500/[0.06] shadow-xl backdrop-blur-md transition-all duration-300 hover:border-amber-500/20 hover:bg-amber-500/[0.02] group"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent"
          />

          <div className="flex items-center justify-between gap-3 px-3 py-2">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <div className="flex size-6 shrink-0 items-center justify-center rounded-md border border-amber-500/10 bg-amber-500/15 text-amber-500 transition-transform duration-200 group-hover:scale-105">
                <Sparkles className="size-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 text-[11px] font-semibold leading-tight text-foreground">
                  <span className="truncate">{t("update.installedTitle") || "GeoHelper Updated!"}</span>
                  <ChevronRight className="size-3 shrink-0 text-muted-foreground opacity-60 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" />
                </div>
                <div className="mt-0.5 truncate text-[10px] text-muted-foreground/80">
                  v{latestVersion.version} - {latestVersion.date}
                </div>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              title={t("update.dismiss") || "Dismiss"}
              className="inline-flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  )
}
