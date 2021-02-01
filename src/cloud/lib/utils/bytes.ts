export function bytesToGigaBytes(n: number) {
  return Math.floor(n / Math.pow(1024, 3))
}

export function bytesToMegaBytes(n: number) {
  return Math.floor(n / Math.pow(1024, 2))
}

export function gigaBytesToMegaBytes(n: number) {
  return Math.floor(n * 1024)
}
