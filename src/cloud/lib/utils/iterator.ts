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
