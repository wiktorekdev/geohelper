export type DebouncedWriter<T> = {
  schedule: (value: T) => void
  save: (value: T) => Promise<void>
  settled: () => Promise<void>
}

export function createDebouncedWriter<T>(
  write: (value: T) => Promise<void>,
  delayMs: number
): DebouncedWriter<T> {
  let timer: ReturnType<typeof setTimeout> | null = null
  let pending: T | null = null
  let chain = Promise.resolve()

  const enqueue = (value: T) => {
    chain = chain.catch(() => undefined).then(() => write(value))
    return chain
  }

  const clearPending = () => {
    if (timer) clearTimeout(timer)
    timer = null
    pending = null
  }

  return {
    schedule(value) {
      pending = value
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        const next = pending
        timer = null
        pending = null
        if (next) void enqueue(next)
      }, delayMs)
    },
    save(value) {
      clearPending()
      return enqueue(value)
    },
    settled() {
      return chain
    },
  }
}
