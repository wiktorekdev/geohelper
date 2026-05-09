import { useEffect } from "react";
import { useStore } from "@/lib/store";

export function useTheme() {
  const theme = useStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);
}
