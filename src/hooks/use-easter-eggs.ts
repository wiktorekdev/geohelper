import { useEffect, useState } from "react"
import toast from "react-hot-toast"

import { useT } from "@/lib/i18n"

export type FloatingHeart = {
  id: number
  x: number
  size: number
  duration: number
  emoji: string
}

const HEARTS = ["❤️", "💖", "💝", "💕", "💘", "💚", "💙", "💜", "💛"]

export function useEasterEggs() {
  const t = useT()
  const [hearts, setHearts] = useState<FloatingHeart[]>([])
  const [isBarrelRolling, setIsBarrelRolling] = useState(false)

  useEffect(() => {
    let buffer = ""
    const timeouts = new Set<ReturnType<typeof setTimeout>>()

    const schedule = (callback: () => void, delay: number) => {
      const timeout = setTimeout(() => {
        timeouts.delete(timeout)
        callback()
      }, delay)
      timeouts.add(timeout)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.length !== 1) return
      buffer = (buffer + event.key.toLowerCase()).slice(-20)

      if (buffer.endsWith("ilovegeohelper")) {
        buffer = ""
        toast(t("easteregg.appreciation"), { duration: 5000 })
        const next = Array.from({ length: 28 }, (_, index) => ({
          id: Math.random() + index,
          x: Math.random() * 80 + 10,
          size: Math.random() * 24 + 18,
          duration: Math.random() * 1.8 + 1.6,
          emoji: HEARTS[Math.floor(Math.random() * HEARTS.length)],
        }))
        setHearts((current) => [...current, ...next])
        schedule(
          () => setHearts((current) => current.filter((heart) => !next.includes(heart))),
          3500
        )
      } else if (buffer.endsWith("doabarrelroll")) {
        buffer = ""
        setIsBarrelRolling(true)
        schedule(() => setIsBarrelRolling(false), 1200)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      for (const timeout of timeouts) clearTimeout(timeout)
    }
  }, [t])

  return { hearts, isBarrelRolling }
}
