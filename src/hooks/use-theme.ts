import { useEffect } from "react"

import { applyTheme } from "@/lib/themes/apply"
import { selectActiveTheme, useThemeStore } from "@/lib/themes/store"

export function useTheme() {
  const hydrate = useThemeStore((s) => s.hydrate)
  const theme = useThemeStore(selectActiveTheme)

  useEffect(() => {
    void hydrate()
  }, [hydrate])

  useEffect(() => {
    applyTheme(theme)
  }, [theme])
}
