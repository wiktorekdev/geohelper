import { useEffect, useState } from "react"
import { LazyMotion, domAnimation, m, AnimatePresence } from "motion/react"
import toast from "react-hot-toast"

import { useBridge } from "@/hooks/use-bridge"
import { useTheme } from "@/hooks/use-theme"
import { Sidebar } from "@/components/sidebar"
import { SettingsSidebar } from "@/components/settings-panel"
import { ChangelogSidebar } from "@/components/changelog-panel"
import { MapView } from "@/components/map-view"
import { EditToolbar } from "@/components/display/edit-toolbar"
import { MarkerToolbar } from "@/components/display/marker-toolbar"
import { SelectionToolbar } from "@/components/display/selection-toolbar"
import { useMapWindowLayout } from "@/hooks/use-map-window-layout"
import { useStore } from "@/lib/store"
import { useUpdateStore } from "@/lib/update-store"
import { useDisplayStore } from "@/lib/display-store"
import { useI18n, useT } from "@/lib/i18n"
import { useThemeStore } from "@/lib/themes/store"
import { migrateLegacyStorage } from "@/lib/settings-persistence"
import { ipc } from "@/lib/ipc"
import { logger } from "@/lib/logger"

function SidebarPanel({
  settingsOpen,
  changelogOpen,
}: {
  settingsOpen: boolean
  changelogOpen: boolean
}) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {settingsOpen ? (
        <m.div
          key="settings"
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -15 }}
          transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
          className="h-full w-full"
        >
          <SettingsSidebar />
        </m.div>
      ) : changelogOpen ? (
        <m.div
          key="changelog"
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -15 }}
          transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
          className="h-full w-full"
        >
          <ChangelogSidebar />
        </m.div>
      ) : (
        <m.div
          key="sidebar"
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 15 }}
          transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
          className="h-full w-full"
        >
          <Sidebar />
        </m.div>
      )}
    </AnimatePresence>
  )
}

interface Heart {
  id: number
  x: number
  size: number
  duration: number
  emoji: string
}

export default function App() {
  useBridge()
  useTheme()
  const t = useT()

  const [hearts, setHearts] = useState<Heart[]>([])
  const [isBarrelRolling, setIsBarrelRolling] = useState(false)

  useEffect(() => {
    let buffer = ""
    const targetWord = "ilovegeohelper"
    const barrelWord = "doabarrelroll"
    const emojis = ["❤️", "💖", "💝", "💕", "💘", "💚", "💙", "💜", "💛"]

    const handleKeyDown = (e: KeyboardEvent) => {
      // Capture simple alphanumeric characters without modifier keys
      if (e.key.length === 1) {
        buffer = (buffer + e.key.toLowerCase()).slice(-20)
        if (buffer.endsWith(targetWord)) {
          buffer = "" // Clear buffer
          toast(t("easteregg.appreciation"), {
            duration: 5000,
          })

          const newHearts: Heart[] = Array.from({ length: 28 }).map((_, i) => ({
            id: Math.random() + i,
            x: Math.random() * 80 + 10, // distribute across 10-90% of screen width
            size: Math.random() * 24 + 18, // 18px to 42px
            duration: Math.random() * 1.8 + 1.6, // 1.6s to 3.4s
            emoji: emojis[Math.floor(Math.random() * emojis.length)],
          }))

          setHearts((prev) => [...prev, ...newHearts])

          // Clean up these specific hearts after their animations finish
          setTimeout(() => {
            setHearts((prev) => prev.filter((h) => !newHearts.some((nh) => nh.id === h.id)))
          }, 3500)
        } else if (buffer.endsWith(barrelWord)) {
          buffer = "" // Clear buffer
          setIsBarrelRolling(true)
          setTimeout(() => {
            setIsBarrelRolling(false)
          }, 1200)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])


  const settingsOpen = useStore((s) => s.settingsOpen)
  const changelogOpen = useStore((s) => s.changelogOpen)
  const hydrateSettings = useStore((s) => s.hydrateSettings)
  const alwaysOnTop = useStore((s) => s.alwaysOnTop)
  const runUpdateCheck = useUpdateStore((s) => s.runUpdateCheck)
  const detectInstallKind = useUpdateStore((s) => s.detectInstallKind)
  const hydrateUpdate = useUpdateStore((s) => s.hydrate)

  const mapVisible = useDisplayStore((s) => s.mapVisible)
  const resizing = useDisplayStore((s) => s.resizing)
  const hydrateDisplay = useDisplayStore((s) => s.hydrate)
  const sidebarWidth = useDisplayStore((s) => s.sidebarWidth)
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth)
  const toolbarLeft = mapVisible && viewportWidth - sidebarWidth >= 280 ? sidebarWidth : 0

  useMapWindowLayout()

  useEffect(() => {
    void (async () => {
      try {
        // 1. Perform automatic migration from legacy localStorage/themes.json
        await migrateLegacyStorage()

        // 2. Hydrate all stores concurrently from settings.json, catching individual rejections
        const hydrationResults = await Promise.allSettled([
          hydrateSettings(),
          hydrateDisplay(),
          useI18n.getState().hydrate(),
          useThemeStore.getState().hydrate(),
          hydrateUpdate(),
        ])

        // Safely log any partial hydration failures while allowing the app to launch
        hydrationResults.forEach((result, index) => {
          if (result.status === "rejected") {
            logger.error(`Resilient Hydration: Slice index ${index} failed to load:`, result.reason)
          }
        })

        // 3. Trigger initial updates and checks
        void runUpdateCheck()
        void detectInstallKind()
      } catch (e) {
        logger.error("Failed startup store migration and hydration:", e)
      }
    })()
  }, [hydrateSettings, hydrateDisplay, hydrateUpdate, runUpdateCheck, detectInstallKind])

  // Debounce so a rapid toggle (or alwaysOnTop hydrating right after layout)
  // doesn't fire two consecutive set_always_on_top calls; on Windows that
  // produced a visible flicker during the first paint.
  useEffect(() => {
    const t = setTimeout(() => {
      ipc.setAlwaysOnTop(alwaysOnTop).catch((e) => {
        logger.warn("setAlwaysOnTop failed:", e)
      })
    }, 50)
    return () => clearTimeout(t)
  }, [alwaysOnTop])

  // Suppress the default webview context menu in release builds, but keep it
  // on inputs / textareas so users can still paste and use browser affordances
  // in places where it matters. Dev builds keep the menu so we can inspect.
  useEffect(() => {
    if (import.meta.env.DEV) return
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      if (target?.closest("input, textarea, [contenteditable='true']")) return
      e.preventDefault()
    }
    document.addEventListener("contextmenu", handler)
    return () => document.removeEventListener("contextmenu", handler)
  }, [])

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <LazyMotion features={domAnimation}>
      <div className={`flex h-screen w-screen overflow-hidden bg-background ${isBarrelRolling ? "animate-barrel-roll" : ""}`}>
        <div className="flex h-full w-full">
          <div
            className={
              resizing
                ? "h-full overflow-hidden"
                : "h-full overflow-hidden transition-[width] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
            }
            style={{ width: sidebarWidth }}
          >
            <SidebarPanel settingsOpen={settingsOpen} changelogOpen={changelogOpen} />
          </div>
          <AnimatePresence mode="popLayout" initial={false}>
            {mapVisible && (
              <m.main
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-background"
              >
                <MapView />
              </m.main>
            )}
          </AnimatePresence>
        </div>
        <div
          className="pointer-events-none fixed inset-x-0 z-[2000] flex flex-col-reverse items-center gap-2 px-2 transition-[bottom,left] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
          style={{
            left: toolbarLeft,
            bottom: mapVisible ? 12 : 54,
          }}
        >
          <EditToolbar />
          <SelectionToolbar />
          <MarkerToolbar />
        </div>

        {hearts.map((heart) => (
          <span
            key={heart.id}
            className="pointer-events-none fixed bottom-[-50px] z-[9999] animate-float-heart"
            style={{
              left: `${heart.x}%`,
              fontSize: `${heart.size}px`,
              animationDuration: `${heart.duration}s`,
            }}
          >
            {heart.emoji}
          </span>
        ))}
      </div>
    </LazyMotion>
  )
}
