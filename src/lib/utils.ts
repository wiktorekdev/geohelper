import { colord } from "colord"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizeHexColor(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback
  const color = colord(value.trim())
  return color.isValid() ? color.toHex() : fallback
}
