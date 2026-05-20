export const DEFAULT_FETCH_TIMEOUT_MS = 8_000

export function timeoutSignal(
  timeoutMs = DEFAULT_FETCH_TIMEOUT_MS,
  parent?: AbortSignal
): AbortSignal {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs)

  const abort = () => controller.abort()
  parent?.addEventListener("abort", abort, { once: true })
  controller.signal.addEventListener(
    "abort",
    () => {
      window.clearTimeout(timeout)
      parent?.removeEventListener("abort", abort)
    },
    { once: true }
  )

  return controller.signal
}
