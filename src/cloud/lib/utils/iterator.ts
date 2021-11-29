export function filterIter<T>(
  predicate: (value: T) => boolean,
  iter: Iterable<T>
) {
  const result = []
  for (const item of iter) {
    if (predicate(item)) {
      result.push(item)
    }
  }
  return result
}

export function mapIter<T, U>(map: (value: T) => U, iter: Iterable<T>): U[] {
  const result = []
  for (const item of iter) {
    result.push(map(item))
  }
  return result
}
