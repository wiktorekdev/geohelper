import type { Coords } from "@/types"
import { latLngClose } from "@/lib/coords"
import { fetchCountryDetails } from "@/lib/country-info"
import { reverseGeocode } from "@/lib/geocode"
import { useStore } from "@/lib/store"

type EnrichmentRun = {
  id: number
  coords: Coords
  signal: AbortSignal
}

export type LocationEnrichmentSession = {
  start: (coords: Coords) => void
  cancel: () => void
}

export function createLocationEnrichmentSession(
  isActive: () => boolean
): LocationEnrichmentSession {
  let runId = 0
  let abort: AbortController | null = null

  function isFresh(run: EnrichmentRun): boolean {
    return isActive() && run.id === runId && !run.signal.aborted
  }

  function currentMatches(coords: Coords): boolean {
    const current = useStore.getState().current
    return !!current && latLngClose(current.lat, current.lng, coords.lat, coords.lng)
  }

  async function enrich(run: EnrichmentRun): Promise<void> {
    if (!isFresh(run)) return

    const store = useStore.getState()
    store.setLocationLoading(true)

    const { place, error } = await reverseGeocode(run.coords.lat, run.coords.lng, run.signal)
    if (!isFresh(run)) return
    if (!currentMatches(run.coords)) {
      useStore.getState().setLocationLoading(false)
      return
    }

    const details = place.countryCode
      ? await fetchCountryDetails(place.countryCode, run.signal)
      : null
    if (!isFresh(run)) return
    if (!currentMatches(run.coords)) {
      useStore.getState().setLocationLoading(false)
      return
    }

    const latest = useStore.getState()
    latest.setPlace(place)
    latest.setGeocodeError(error)
    latest.setCountryDetails(details)
    latest.setLocationLoading(false)
  }

  return {
    start: (coords) => {
      if (!isActive()) return
      const previous = useStore.getState().current
      if (previous && latLngClose(previous.lat, previous.lng, coords.lat, coords.lng)) return

      abort?.abort()
      abort = new AbortController()
      const run = { id: ++runId, coords, signal: abort.signal }
      useStore.getState().pushCoords(coords)
      void enrich(run)
    },
    cancel: () => {
      runId++
      abort?.abort()
      abort = null
      useStore.getState().setLocationLoading(false)
    },
  }
}
