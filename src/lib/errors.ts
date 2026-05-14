export function errorMessage(error: unknown, fallback = "Unexpected error"): string {
  return error instanceof Error ? error.message : fallback;
}
