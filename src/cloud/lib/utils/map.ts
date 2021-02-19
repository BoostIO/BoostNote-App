export function getMapEntries<T>(map: Map<string, T>): [string, T][] {
  return [...map.entries()]
}
