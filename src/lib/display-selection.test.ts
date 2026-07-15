import { describe, expect, it } from "vitest"

import {
  DEFAULT_TEXT_STYLE,
  applySelectionStyle,
  normalizeTextFont,
  normalizeTextSize,
  resetWidgetTextState,
  selectRegisteredWidgetTexts,
} from "./display-selection"

describe("display selection", () => {
  it("normalizes legacy and invalid text settings", () => {
    expect(normalizeTextSize("sm")).toBe(11)
    expect(normalizeTextSize(100)).toBe(40)
    expect(normalizeTextFont("jetbrains")).toBe("JetBrains Mono")
    expect(normalizeTextFont("unknown")).toBe(DEFAULT_TEXT_STYLE.fontFamily)
  })

  it("only applies size changes to the country flag", () => {
    const styles = applySelectionStyle({}, ["country.flag"], {
      color: "#ff0000",
      bold: true,
      fontSize: 22,
    })

    expect(styles["country.flag"]).toEqual({ ...DEFAULT_TEXT_STYLE, fontSize: 22 })
  })

  it("selects only registered text belonging to a widget", () => {
    const registered = {
      "country.name": true,
      "country.flag": true,
      "road.name": true,
    } as const

    expect(selectRegisteredWidgetTexts(registered, "country", [], false)).toEqual([
      "country.name",
      "country.flag",
    ])
  })

  it("resets one widget without touching other state", () => {
    const style = { ...DEFAULT_TEXT_STYLE, bold: true }
    const result = resetWidgetTextState(
      "country",
      { "country.name": style, "road.name": style },
      { "country.flag": true, "road.name": true },
      ["country.name", "road.name"]
    )

    expect(result).toEqual({
      textStyles: { "road.name": style },
      hiddenTexts: { "road.name": true },
      selection: ["road.name"],
    })
  })
})
