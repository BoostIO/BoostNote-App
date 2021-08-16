export function bytesToGigaBytes(n: number) {
  return roundUpSecondDecimal(n / Math.pow(1024, 3))
}

export function bytesToMegaBytes(n: number) {
  return roundUpSecondDecimal(n / Math.pow(1024, 2))
}

export function gigaBytesToMegaBytes(n: number) {
  return roundUpSecondDecimal(n * 1024)
}

function roundUpSecondDecimal(n: number) {
  return Math.round(n * 100 + Number.EPSILON) / 100
}
