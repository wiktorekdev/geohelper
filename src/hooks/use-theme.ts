import { useEffect } from "react"

import { applyTheme } from "@/lib/themes/apply"
import { selectActiveTheme, useThemeStore } from "@/lib/themes/store"

export function useTheme() {
  const hydrate = useThemeStore((s) => s.hydrate)
  const theme = useThemeStore(selectActiveTheme)
  // Re-apply when the user themes list or hidden set changes too — editing
  // the active theme should reflect immediately.
  const userThemes = useThemeStore((s) => s.userThemes)

  useEffect(() => {
    void hydrate()
  }, [hydrate])

  useEffect(() => {
    applyTheme(theme)
    // userThemes is part of the dependency so live edits to the active user
    // theme re-apply without a page reload.
  }, [theme, userThemes])
}
