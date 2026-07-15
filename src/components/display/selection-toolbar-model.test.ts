import { describe, expect, it } from "vitest"

import { DEFAULT_TEXT_STYLE } from "@/lib/display-store"
import { parseColorInput, selectionKind, summarizeSelectionStyles } from "./selection-toolbar-model"

describe("selection toolbar model", () => {
  it("parses supported color inputs", () => {
    expect(parseColorInput("#abc")).toBe("#aabbcc")
    expect(parseColorInput("rgb(12, 34, 56)")).toBe("#0c2238")
    expect(parseColorInput("300, 0, 0")).toBeNull()
  })

  it("limits flag selections to flag capabilities", () => {
    expect(selectionKind("country.flag")).toBe("flag")
    expect(selectionKind("country.name")).toBe("text")
  })

  it("summarizes shared and mixed styles", () => {
    const first = { ...DEFAULT_TEXT_STYLE, bold: true, fontSize: 18 }
    const second = { ...first, fontSize: 20 }
    expect(summarizeSelectionStyles([first, second])).toMatchObject({
      bold: true,
      fontSize: undefined,
    })
  })
})
