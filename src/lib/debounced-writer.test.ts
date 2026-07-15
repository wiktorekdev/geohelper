import { afterEach, describe, expect, it, vi } from "vitest"

import { createDebouncedWriter } from "./debounced-writer"

afterEach(() => {
  vi.useRealTimers()
})

describe("createDebouncedWriter", () => {
  it("coalesces scheduled values", async () => {
    vi.useFakeTimers()
    const values: number[] = []
    const writer = createDebouncedWriter(async (value: number) => {
      values.push(value)
    }, 250)

    writer.schedule(1)
    writer.schedule(2)
    await vi.advanceTimersByTimeAsync(250)
    await writer.settled()

    expect(values).toEqual([2])
  })

  it("cancels a stale scheduled value when saving immediately", async () => {
    vi.useFakeTimers()
    const values: number[] = []
    const writer = createDebouncedWriter(async (value: number) => {
      values.push(value)
    }, 250)

    writer.schedule(1)
    await writer.save(2)
    await vi.runAllTimersAsync()

    expect(values).toEqual([2])
  })

  it("serializes writes in call order", async () => {
    const events: string[] = []
    const writer = createDebouncedWriter(async (value: number) => {
      events.push(`start:${value}`)
      await Promise.resolve()
      events.push(`end:${value}`)
    }, 250)

    const first = writer.save(1)
    const second = writer.save(2)
    await Promise.all([first, second])

    expect(events).toEqual(["start:1", "end:1", "start:2", "end:2"])
  })
})
