import { useEffect, useState } from "react"
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  PlusCircle,
  RefreshCw,
  Search,
  Trash2,
  Wrench,
} from "lucide-react"
import { openUrl } from "@tauri-apps/plugin-opener"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useDisplayStore } from "@/lib/display-store"
import { useI18n, useT } from "@/lib/i18n"
import type { ChangelogItem } from "@/lib/whats-new-store"
import { useStore } from "@/lib/store"
import { useWhatsNewStore } from "@/lib/whats-new-store"
import { cn } from "@/lib/utils"

const CATEGORY_ORDER: ChangelogItem["category"][] = ["Added", "Changed", "Fixed", "Removed"]

const CATEGORY_STYLES: Record<ChangelogItem["category"], string> = {
  Added: "border-emerald-500/20 bg-emerald-500/10 text-emerald-500",
  Changed: "border-blue-500/20 bg-blue-500/10 text-blue-500",
  Fixed: "border-amber-500/25 bg-amber-500/10 text-amber-500",
  Removed: "border-red-500/20 bg-red-500/10 text-red-500",
}

const CATEGORY_ICONS: Record<ChangelogItem["category"], React.ReactNode> = {
  Added: <PlusCircle className="size-3.5 shrink-0" />,
  Changed: <RefreshCw className="size-3.5 shrink-0" />,
  Fixed: <Wrench className="size-3.5 shrink-0" />,
  Removed: <Trash2 className="size-3.5 shrink-0" />,
}

export function ChangelogSidebar() {
  const t = useT()
  const locale = useI18n((s) => s.locale)
  const close = useStore((s) => s.closeChangelog)
  const sidebarWidth = useDisplayStore((s) => s.sidebarWidth)
  const {
    versions,
    loading,
    error,
    fetchChangelog,
    markAsRead,
    selectedVersion,
    setSelectedVersion,
    backToSidebar,
  } = useWhatsNewStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [expandedVersions, setExpandedVersions] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchChangelog()
  }, [fetchChangelog])

  useEffect(() => {
    markAsRead()
  }, [versions, markAsRead])

  const query = searchQuery.toLowerCase().trim()
  const filteredVersions = versions
    .map((ver) => {
      if (!query) return { ...ver, isVersionMatch: false }

      const matchingItems = ver.items.filter(
        (item) =>
          item.text.toLowerCase().includes(query) || item.category.toLowerCase().includes(query)
      )

      return {
        ...ver,
        items: matchingItems,
        isVersionMatch:
          ver.version.toLowerCase().includes(query) || ver.date.toLowerCase().includes(query),
      }
    })
    .filter((ver) => ver.items.length > 0 || ver.isVersionMatch)

  const toggleVersion = (version: string) => {
    setExpandedVersions((prev) => ({ ...prev, [version]: !prev[version] }))
  }

  function highlightText(text: string, activeQuery: string) {
    if (!activeQuery) return text

    const escapedQuery = activeQuery.replace(/[-\\^$*+?.()|[\]{}]/g, "\\$&")
    const regex = new RegExp(`(${escapedQuery})`, "gi")
    const parts = text.split(regex)

    return parts.map((part, i) =>
      part.toLowerCase() === activeQuery.toLowerCase() ? (
        <mark
          key={i}
          className="rounded-sm bg-brand/15 px-0.5 font-medium text-foreground ring-1 ring-brand/20"
        >
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  function renderFormattedText(text: string, activeQuery: string) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        const innerText = part.slice(2, -2)
        return (
          <strong key={i} className="font-semibold text-foreground">
            {highlightText(innerText, activeQuery)}
          </strong>
        )
      }
      return <span key={i}>{highlightText(part, activeQuery)}</span>
    })
  }

  if (selectedVersion) {
    const groupedItems = CATEGORY_ORDER.map((category) => ({
      category,
      items: selectedVersion.items.filter((item) => item.category === category),
    })).filter((group) => group.items.length > 0)

    return (
      <aside
        className="flex h-full shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar animate-in slide-in-from-left duration-200"
        style={{ width: sidebarWidth }}
      >
        <header className="flex items-center gap-2 border-b border-white/[0.04] p-3.5">
          <Button
            size="icon"
            variant="ghost"
            className="size-7 text-muted-foreground hover:text-foreground"
            onClick={() => {
              if (backToSidebar) {
                setSelectedVersion(null, false)
                close()
              } else {
                setSelectedVersion(null, false)
              }
            }}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div className="text-[13px] font-semibold tracking-tight text-foreground">
            {t("update.releaseDetails")}
          </div>
        </header>

        <ScrollArea className="min-h-0 flex-1">
          <div className="px-4 py-4">
            <div className="mb-4 border-l-2 border-brand/40 pl-3">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {formatDate(selectedVersion.date, locale)}
              </div>
              <h2 className="mt-0.5 text-lg font-semibold tracking-tight text-foreground">
                v{selectedVersion.version}
              </h2>
            </div>

            {groupedItems.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">
                Maintenance and minor stability improvements.
              </p>
            ) : (
              <div className="space-y-2.5">
                {groupedItems.map(({ category, items }) => (
                  <section
                    key={category}
                    className="rounded-md border border-sidebar-border/40 bg-accent/10 p-2.5"
                  >
                    <div className="mb-2 flex items-center gap-1.5 border-b border-sidebar-border/20 pb-1.5">
                      <span
                        className={cn(
                          "inline-flex size-5 items-center justify-center rounded-sm border",
                          CATEGORY_STYLES[category]
                        )}
                      >
                        {CATEGORY_ICONS[category]}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wide text-foreground">
                        {category}
                      </span>
                      <span className="ml-auto rounded-sm bg-accent/50 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
                        {items.length}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-1.5 pl-0.5 text-[11px] leading-snug text-foreground/80"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-sm bg-muted-foreground/45" />
                          <span className="flex-1">{renderFormattedText(item.text, "")}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}

            <div className="mt-4 pb-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-full gap-1.5 rounded-md border-sidebar-border text-[11px] text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground"
                onClick={() =>
                  openUrl(
                    `https://github.com/wiktorekdev/geohelper/releases/tag/v${selectedVersion.version}`
                  )
                }
              >
                <ExternalLink className="size-3" />
                {t("update.viewOnGithub")}
              </Button>
            </div>
          </div>
        </ScrollArea>
      </aside>
    )
  }

  return (
    <aside
      className="flex h-full shrink-0 flex-col border-r border-sidebar-border bg-sidebar"
      style={{ width: sidebarWidth }}
    >
      <header className="flex items-center gap-2 border-b border-white/[0.04] p-3.5">
        <Button
          size="icon"
          variant="ghost"
          className="size-7 text-muted-foreground hover:text-foreground"
          onClick={close}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="text-[13px] font-semibold tracking-tight text-foreground">
          {t("update.changelog")}
        </div>
      </header>

      <div className="border-b border-white/[0.03] px-4 py-2.5">
        <div className="relative flex items-center">
          <Search className="absolute left-2.5 size-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder={t("update.searchChangelog")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] py-1.5 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-brand/30 focus:outline-none focus:ring-1 focus:ring-brand/30"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-4 py-4">
          {loading ? (
            <div className="flex h-[360px] flex-col items-center justify-center gap-2">
              <RefreshCw className="size-6 animate-spin text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Checking updates...</p>
            </div>
          ) : error ? (
            <div className="flex h-[360px] flex-col items-center justify-center gap-2 px-4 text-center">
              <AlertCircle className="size-6 text-destructive" />
              <p className="text-xs font-medium text-destructive">Failed to fetch changelog</p>
              <p className="text-[10px] text-muted-foreground">{error}</p>
            </div>
          ) : filteredVersions.length === 0 ? (
            <div className="flex h-[360px] items-center justify-center text-xs text-muted-foreground">
              No matches found.
            </div>
          ) : (
            <div className="space-y-4 pr-1">
              {filteredVersions.map((ver, idx) => {
                const isExpanded = query ? true : (expandedVersions[ver.version] ?? idx === 0)

                return (
                  <div key={ver.version} className="relative pl-5">
                    {idx !== filteredVersions.length - 1 && (
                      <span className="absolute bottom-0 left-[4px] top-6 w-px bg-white/[0.08]" />
                    )}

                    <span className="absolute left-[2px] top-[10px] size-[5px] rounded-full bg-brand/70" />

                    <div className="-m-1 mb-2 flex w-full items-center justify-between rounded-md p-1 transition-colors hover:bg-accent/20 group">
                      <button
                        onClick={() => toggleVersion(ver.version)}
                        className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
                      >
                        <span className="text-xs font-bold text-foreground transition-colors group-hover:text-brand">
                          v{ver.version}
                        </span>
                        <span className="rounded-sm bg-accent/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {formatDate(ver.date, locale)}
                        </span>
                        {isExpanded ? (
                          <ChevronDown className="ml-1 size-3.5 shrink-0 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="ml-1 size-3.5 shrink-0 text-muted-foreground" />
                        )}
                      </button>

                      <button
                        onClick={() => setSelectedVersion(ver)}
                        title={t("update.viewDetails")}
                        className="mr-1 inline-flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-brand"
                      >
                        <ArrowUpRight className="size-3.5" />
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="mt-2.5 space-y-2.5 pb-2 animate-in fade-in slide-in-from-top-1 duration-150">
                        {ver.items.length === 0 ? (
                          <p className="text-xs text-muted-foreground">Maintenance updates.</p>
                        ) : (
                          ver.items.map((item, i) => (
                            <div key={i} className="text-xs leading-relaxed text-foreground/80">
                              <span
                                className={cn(
                                  "mr-2 inline-block rounded-sm border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide",
                                  CATEGORY_STYLES[item.category]
                                )}
                              >
                                {item.category}
                              </span>
                              <span>{renderFormattedText(item.text, query)}</span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </ScrollArea>
    </aside>
  )
}

function formatDate(date: string, locale: string) {
  const parsed = new Date(`${date}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return date

  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed)
}
