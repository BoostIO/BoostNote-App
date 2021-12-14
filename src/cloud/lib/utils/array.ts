import { sortBy, compose, toLower, prop, reverse } from 'ramda'
import { isValidUUID } from './string'

export const uniqueByKey = <T, K extends keyof T>(key: K, arr: T[]): T[] => {
  const seen = new Set<any>()
  return arr.filter((val) => {
    if (!seen.has(val[key])) {
      seen.add(val[key])
      return true
    }
    return false
  })
}

export function filterOutFromArray(sources: string[], item: string) {
  return sources.filter((source) => source !== item)
}

export function getIndexMapFromArray(sources: string[]) {
  return sources.reduce((acc, source, index) => {
    acc.set(source, index)
    return acc
  }, new Map<string, number>())
}

export function sortArrayByIntProperty(source: any[], property: string) {
  return source.sort((a, b) => {
    const aRank = a[property] != null ? a[property] : 9999
    const bRank = b[property] != null ? b[property] : 9999
    return aRank - bRank
  })
}

export function joinWithFinalDeliminator(
  arr: string[],
  delim = ', ',
  finalDelim = ' and '
) {
  if (arr.length === 0) {
    return ''
  }
  if (arr.length < 2) {
    return arr[0]
  }

  return `${arr.slice(0, arr.length - 1).join(delim)}${finalDelim}${
    arr[arr.length - 1]
  }`
}

export function arraysAreIdentical<T>(source: T[], compare: T[]) {
  if (source.length !== compare.length) {
    return false
  }

  for (let i = 0; i < source.length; i++) {
    if (JSON.stringify(source[i]) !== JSON.stringify(compare[i])) {
      return false
    }
  }
  return true
}

type WithId<T, K> = T & { id: K }

export function getMapFromEntityArray<T, K>(arr: WithId<T, K>[]): Map<K, T> {
  return arr.reduce((acc, val) => {
    acc.set(val.id, val)
    return acc
  }, new Map<K, T>())
}

export function removeDuplicates<T>(arr: T[]) {
  const s = new Set(arr)
  const it = s.values()
  return Array.from(it)
}

export function splitIntoChunks<E>(array: E[], chunkSize: number): E[][] {
  const chunks = []
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize))
  }
  return chunks
}

export function sortByAttributeAsc<T>(attribute: keyof T, array: T[]) {
  return sortBy(compose(toLower, prop(attribute as string)))(array)
}

export function sortByAttributeDesc<T>(attribute: keyof T, array: T[]) {
  return reverse(sortBy(compose(toLower, prop(attribute as string)))(array))
}

export function isUUIDArray<T>(source: T): boolean {
  if (!Array.isArray(source)) {
    return false
  }

  return source.reduce((acc, val) => {
    if (typeof val !== 'string' || !isValidUUID(val)) {
      acc = false
    }
    return acc
  }, true)
}

export function getArrayFromRecord<K>(
  source: Record<'string | number | symbol', K>
): K[] {
  return Object.entries(source).map(([, val]) => val)
}

export function getPropertyFromArray<T>(attribute: keyof T, array: T[]) {
  return array.map((val) => prop(attribute, val))
}
