import { describe, expect, it } from "vitest"

import { formatCoords, latLngClose } from "./coords"

describe("coordinates", () => {
  it("detects coordinates within the duplicate threshold", () => {
    expect(latLngClose(52.23, 21.01, 52.23004, 21.01004)).toBe(true)
    expect(latLngClose(52.23, 21.01, 52.231, 21.01)).toBe(false)
  })

  it("formats both coordinate orders", () => {
    const coords = { lat: 52.23, lng: 21.01, source: "test", timestamp: 1 }
    expect(formatCoords(coords, "lat,lng")).toBe("52.23,21.01")
    expect(formatCoords(coords, "lng,lat")).toBe("21.01,52.23")
  })
})
