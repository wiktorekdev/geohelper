import { useEffect, useState } from "react"
import {
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Search,
  ArrowUpRight,
  Sparkles,
  ExternalLink,
  PlusCircle,
  Wrench,
  Trash2,
} from "lucide-react"
import { openUrl } from "@tauri-apps/plugin-opener"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useWhatsNewStore } from "@/lib/whats-new-store"
import { useDisplayStore } from "@/lib/display-store"
import { useStore } from "@/lib/store"
import { useT } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export function ChangelogSidebar() {
  const t = useT()
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
  // Keep track of which versions are manually expanded/collapsed
  const [expandedVersions, setExpandedVersions] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchChangelog()
  }, [fetchChangelog])

  // Mark as read when this panel is shown
  useEffect(() => {
    markAsRead()
  }, [versions, markAsRead])

  // Domyślnie rozwijamy najnowszą wersję przy załadowaniu danych
  // Helper to highlight matched search terms with a premium amber glow
  function highlightText(text: string, query: string) {
    if (!query) return text

    const escapedQuery = query.replace(/[-\\^$*+?.()|[\]{}]/g, "\\$&")
    const regex = new RegExp(`(${escapedQuery})`, "gi")
    const parts = text.split(regex)

    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark
          key={i}
          className="bg-amber-500/25 text-amber-300 font-medium px-0.5 rounded border border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.1)]"
        >
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  // Helper to format bold markdown tags elegantly and inject search highlighting
  function renderFormattedText(text: string, query: string) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        const innerText = part.slice(2, -2)
        return (
          <strong key={i} className="font-semibold text-foreground">
            {highlightText(innerText, query)}
          </strong>
        )
      }
      return <span key={i}>{highlightText(part, query)}</span>
    })
  }

  const toggleVersion = (version: string) => {
    setExpandedVersions((prev) => ({
      ...prev,
      [version]: !prev[version],
    }))
  }

  // Filter versions and their items based on search query
  const query = searchQuery.toLowerCase().trim()
  const filteredVersions = versions
    .map((ver) => {
      if (!query) return { ...ver, isVersionMatch: false }

      const matchingItems = ver.items.filter(
        (item) =>
          item.text.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
      )

      return {
        ...ver,
        items: matchingItems,
        isVersionMatch:
          ver.version.toLowerCase().includes(query) ||
          ver.date.toLowerCase().includes(query),
      }
    })
    .filter((ver) => ver.items.length > 0 || ver.isVersionMatch)

  // ── Render 1: Detail View of a specific version ──
  if (selectedVersion) {
    // Group items by category to make the list extremely compact and organized
    const groupedItems: Record<string, typeof selectedVersion.items> = {
      Added: [],
      Changed: [],
      Fixed: [],
      Removed: [],
    }

    selectedVersion.items.forEach((item) => {
      if (groupedItems[item.category]) {
        groupedItems[item.category].push(item)
      }
    })

    const categoryIcons = {
      Added: <PlusCircle className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />,
      Changed: <RefreshCw className="size-3.5 text-blue-500 shrink-0 mt-0.5" />,
      Fixed: <Wrench className="size-3.5 text-amber-500 shrink-0 mt-0.5" />,
      Removed: <Trash2 className="size-3.5 text-red-500 shrink-0 mt-0.5" />,
    }

    const hasAnyItems = selectedVersion.items.length > 0

    return (
      <aside
        className="flex h-full shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar animate-in slide-in-from-left duration-200"
        style={{ width: sidebarWidth }}
      >
        <header className="flex items-center gap-2 p-3 border-b border-sidebar-border/20">
          <Button
            size="icon"
            variant="ghost"
            className="size-8 text-muted-foreground hover:text-foreground"
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
          <div className="text-[14px] font-semibold tracking-tight text-foreground">
            {t("update.releaseDetails")}
          </div>
        </header>

        {/* Content */}
        <ScrollArea className="min-h-0 flex-1">
          <div className="px-4 py-4">
            {/* Version Header Card */}
            <div className="relative mb-3 overflow-hidden rounded-xl border border-sidebar-border/40 bg-gradient-to-br from-background/80 via-background/60 to-amber-500/[0.02] p-3 text-center">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent"
              />
              <div className="mx-auto mb-1.5 flex size-9 items-center justify-center rounded-xl border border-amber-500/15 bg-amber-500/10 text-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.04)] animate-pulse">
                <Sparkles className="size-4.5" />
              </div>
              <h2 className="text-base font-bold tracking-tight text-foreground">
                v{selectedVersion.version}
              </h2>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Released on {selectedVersion.date}
              </p>
            </div>

            {/* Grouped compact items list */}
            <div className="space-y-3">
              {!hasAnyItems ? (
                <p className="text-xs text-muted-foreground text-center py-6">
                  Maintenance and minor stability improvements.
                </p>
              ) : (
                Object.entries(groupedItems).map(([category, items]) => {
                  if (items.length === 0) return null

                  return (
                    <div
                      key={category}
                      className="space-y-1.5 rounded-xl border border-sidebar-border/30 bg-accent/10 p-2.5 animate-in fade-in-50 transition-all duration-300 hover:border-sidebar-border/70 hover:bg-accent/15 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] group/category"
                    >
                      {/* Compact Category Header */}
                      <div className="flex items-center gap-1.5 border-b border-sidebar-border/20 pb-1.5">
                        {categoryIcons[category as keyof typeof categoryIcons]}
                        <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">
                          {category}
                        </span>
                        <span className="ml-auto text-[9px] font-medium text-muted-foreground bg-accent/40 px-1.5 py-0.2 rounded-md">
                          {items.length}
                        </span>
                      </div>

                      {/* Compact bullet list */}
                      <div className="space-y-1.5">
                        {items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-1.5 pl-0.5 text-[11px] leading-snug text-foreground/80"
                          >
                            <span className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground/50" />
                            <span className="flex-1">{renderFormattedText(item.text, "")}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Compact View on GitHub Button */}
            <div className="mt-4 pb-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1.5 text-[11px] h-8 rounded-lg border-sidebar-border hover:bg-accent/40 text-muted-foreground hover:text-foreground transition-colors"
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

  // ── Render 2: Default List View with search ──
  return (
    <aside
      className="flex h-full shrink-0 flex-col border-r border-sidebar-border bg-sidebar"
      style={{ width: sidebarWidth }}
    >
      {/* Header */}
      <header className="flex items-center gap-2 p-3 border-b border-sidebar-border/20">
        <Button
          size="icon"
          variant="ghost"
          className="size-8 text-muted-foreground hover:text-foreground"
          onClick={close}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="text-[15px] font-semibold tracking-tight text-foreground">
          {t("update.changelog")}
        </div>
      </header>

      {/* Search Bar */}
      <div className="px-4 py-2 border-b border-sidebar-border/10">
        <div className="relative flex items-center">
          <Search className="absolute left-2.5 size-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder={t("update.searchChangelog")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg bg-accent/40 border border-sidebar-border/40 py-1.5 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-brand/40 focus:border-brand/40"
          />
        </div>
      </div>

      {/* Content scroll area */}
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
                    {/* Timeline vertical connector */}
                    {idx !== filteredVersions.length - 1 && (
                      <span className="absolute bottom-0 left-[6px] top-6 w-[1.5px] bg-sidebar-border/30" />
                    )}

                    {/* Timeline dot */}
                    <span className="absolute left-0 top-2 h-3 w-3 rounded-full border-2 border-brand bg-sidebar shadow-sm" />

                    {/* Accordion Header */}
                    <div className="w-full mb-2 flex items-center justify-between hover:bg-accent/20 p-1 -m-1 rounded-md transition-colors group">
                      <button
                        onClick={() => toggleVersion(ver.version)}
                        className="flex flex-1 items-center gap-1.5 text-left"
                      >
                        <span className="text-xs font-bold text-foreground group-hover:text-brand transition-colors">
                          v{ver.version}
                        </span>
                        <span className="text-[10px] font-medium text-muted-foreground bg-accent/40 px-2 py-0.5 rounded-md">
                          {ver.date}
                        </span>
                        {isExpanded ? (
                          <ChevronDown className="size-3.5 text-muted-foreground ml-1" />
                        ) : (
                          <ChevronRight className="size-3.5 text-muted-foreground ml-1" />
                        )}
                      </button>

                      {/* Drill-down details button */}
                      <button
                        onClick={() => setSelectedVersion(ver)}
                        title={t("update.viewDetails")}
                        className="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-brand transition-colors mr-1"
                      >
                        <ArrowUpRight className="size-3.5" />
                      </button>
                    </div>

                    {/* Items list */}
                    {isExpanded && (
                      <div className="mt-2.5 space-y-3 pb-2 animate-in fade-in slide-in-from-top-1 duration-150">
                        {ver.items.length === 0 ? (
                          <p className="text-xs text-muted-foreground">Maintenance updates.</p>
                        ) : (
                          ver.items.map((item, i) => (
                            <div
                              key={i}
                              className="text-xs leading-relaxed text-foreground/80"
                            >
                              <span
                                className={cn(
                                  "mr-2 inline-block rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                                  item.category === "Added" &&
                                    "bg-emerald-500/10 text-emerald-500 border border-emerald-500/10",
                                  item.category === "Changed" &&
                                    "bg-blue-500/10 text-blue-500 border border-blue-500/10",
                                  item.category === "Fixed" &&
                                    "bg-amber-500/10 text-amber-500 border border-amber-500/10",
                                  item.category === "Removed" &&
                                    "bg-red-500/10 text-red-500 border border-red-500/10"
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
