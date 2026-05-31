import { create } from "zustand"
import { invoke } from "@tauri-apps/api/core"

export interface ChangelogItem {
  category: "Added" | "Changed" | "Fixed" | "Removed"
  text: string
}

const CHANGELOG_CATEGORIES = new Set<ChangelogItem["category"]>([
  "Added",
  "Changed",
  "Fixed",
  "Removed",
])

export interface ChangelogVersion {
  version: string
  date: string
  items: ChangelogItem[]
}

interface WhatsNewState {
  versions: ChangelogVersion[]
  hasUnread: boolean
  loading: boolean
  error: string | null
  selectedVersion: ChangelogVersion | null
  backToSidebar: boolean
  setSelectedVersion: (ver: ChangelogVersion | null, backToSidebar?: boolean) => void
  fetchChangelog: () => Promise<void>
  markAsRead: () => void
}

export const useWhatsNewStore = create<WhatsNewState>((set, get) => ({
  versions: [],
  hasUnread: false,
  loading: false,
  error: null,
  selectedVersion: null,
  backToSidebar: false,

  setSelectedVersion: (ver, backToSidebar = false) => set({ selectedVersion: ver, backToSidebar }),

  fetchChangelog: async () => {
    set({ loading: true, error: null })
    try {
      const rawMarkdown = await invoke<string>("sync_and_read_changelog")
      const parsedVersions = parseChangelog(rawMarkdown)

      if (parsedVersions.length > 0) {
        const latestVersion = parsedVersions[0].version
        const lastSeen = localStorage.getItem("geohelper_last_seen_changelog")

        // If never seen or latest is different, mark as unread
        const hasUnread = lastSeen !== latestVersion

        set({
          versions: parsedVersions,
          hasUnread,
          loading: false,
        })
      } else {
        set({ versions: [], hasUnread: false, loading: false })
      }
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : String(err),
        loading: false,
      })
    }
  },

  markAsRead: () => {
    const { versions } = get()
    if (versions.length > 0) {
      const latestVersion = versions[0].version
      localStorage.setItem("geohelper_last_seen_changelog", latestVersion)
      set({ hasUnread: false })
    }
  },
}))

function parseChangelog(markdown: string): ChangelogVersion[] {
  const versions: ChangelogVersion[] = []
  const lines = markdown.split(/\r?\n/)

  let currentVersion: ChangelogVersion | null = null
  let currentCategory: "Added" | "Changed" | "Fixed" | "Removed" | null = null

  const versionRegex = /^##\s+\[?([^\]\s]+)\]?\s*-\s*(\d{4}-\d{2}-\d{2})/
  const categoryRegex = /^###\s+(Added|Changed|Fixed|Removed)/
  const itemRegex = /^-\s+(.+)/

  for (let line of lines) {
    line = line.trim()

    // 1. Match version header: ## [0.19.2] - 2026-05-30
    const versionMatch = line.match(versionRegex)
    if (versionMatch) {
      if (currentVersion) {
        versions.push(currentVersion)
      }
      currentVersion = {
        version: versionMatch[1],
        date: versionMatch[2],
        items: [],
      }
      currentCategory = null
      continue
    }

    if (!currentVersion) continue

    // 2. Match category header: ### Added
    const categoryMatch = line.match(categoryRegex)
    if (categoryMatch && CHANGELOG_CATEGORIES.has(categoryMatch[1] as ChangelogItem["category"])) {
      currentCategory = categoryMatch[1] as ChangelogItem["category"]
      continue
    }

    // 3. Match bullet point item: - Something...
    const itemMatch = line.match(itemRegex)
    if (itemMatch && currentCategory) {
      currentVersion.items.push({
        category: currentCategory,
        text: itemMatch[1],
      })
    }
  }

  // Push the final version
  if (currentVersion) {
    versions.push(currentVersion)
  }

  return versions
}
