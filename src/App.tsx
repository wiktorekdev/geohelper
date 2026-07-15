import { AnimatePresence, domAnimation, LazyMotion, m } from "motion/react"

import { ChangelogSidebar } from "@/components/changelog-panel"
import { EditToolbar } from "@/components/display/edit-toolbar"
import { MarkerToolbar } from "@/components/display/marker-toolbar"
import { SelectionToolbar } from "@/components/display/selection-toolbar"
import { MapView } from "@/components/map-view"
import { SettingsSidebar } from "@/components/settings-panel"
import { Sidebar } from "@/components/sidebar"
import { useAppStartup } from "@/hooks/use-app-startup"
import { useBridge } from "@/hooks/use-bridge"
import { useEasterEggs } from "@/hooks/use-easter-eggs"
import { useMapWindowLayout } from "@/hooks/use-map-window-layout"
import { useTheme } from "@/hooks/use-theme"
import { useViewportWidth } from "@/hooks/use-viewport-width"
import { useDisplayStore } from "@/lib/display-store"
import { useStore } from "@/lib/store"

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

export default function App() {
  useBridge()
  useTheme()
  useMapWindowLayout()
  useAppStartup()

  const { hearts, isBarrelRolling } = useEasterEggs()
  const viewportWidth = useViewportWidth()
  const settingsOpen = useStore((state) => state.settingsOpen)
  const changelogOpen = useStore((state) => state.changelogOpen)
  const mapVisible = useDisplayStore((state) => state.mapVisible)
  const resizing = useDisplayStore((state) => state.resizing)
  const sidebarWidth = useDisplayStore((state) => state.sidebarWidth)
  const toolbarLeft = mapVisible && viewportWidth - sidebarWidth >= 280 ? sidebarWidth : 0

  return (
    <LazyMotion features={domAnimation}>
      <div
        className={`flex h-screen w-screen overflow-hidden bg-background ${isBarrelRolling ? "animate-barrel-roll" : ""}`}
      >
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
          style={{ left: toolbarLeft, bottom: mapVisible ? 12 : 54 }}
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
