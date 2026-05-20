import type { Coords } from "@/types"
import type { CopyFormat } from "@/lib/store"

export const COORD_DUPLICATE_EPS = 5e-5

export function latLngClose(aLat: number, aLng: number, bLat: number, bLng: number): boolean {
  return (
    Math.abs(aLat - bLat) <= COORD_DUPLICATE_EPS && Math.abs(aLng - bLng) <= COORD_DUPLICATE_EPS
  )
}

export function formatCoord(n: number, digits = 6): string {
  return n.toFixed(digits)
}

export function formatCoords(c: Coords, fmt: CopyFormat): string {
  switch (fmt) {
    case "lat,lng":
      return `${c.lat},${c.lng}`
    case "lng,lat":
      return `${c.lng},${c.lat}`
    case "lat, lng":
    default:
      return `${c.lat}, ${c.lng}`
  }
}
