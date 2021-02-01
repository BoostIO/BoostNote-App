export function parseURL(url: string) {
  try {
    return new URL(url)
  } catch {
    return null
  }
}

export function appendQueryParams(params: Record<string, string>, url: URL) {
  const clone = new URL(url.toString())
  for (const [key, value] of Object.entries(params)) {
    clone.searchParams.set(key, value)
  }
  return clone
}
