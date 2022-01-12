export function flattenObj(obj: Record<string, any>): Record<string, any> {
  const result: any = {}
  for (const key in obj) {
    if (isRecord(obj[key])) {
      const flattened = flattenObj(obj[key])
      for (const childKey in flattened) {
        result[`${key}.${childKey}`] = flattened[childKey]
      }
    } else {
      result[key] = obj[key]
    }
  }
  return result
}

export function isRecord(x: unknown): x is Record<string, any> {
  return x != null && typeof x === 'object' && !Array.isArray(x)
}
