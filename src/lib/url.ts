import path from 'path'
import { parse as _parseUrl } from 'url'
import querystring from 'querystring'

export interface Location {
  pathname: string
  hash: string
  search: string
}

export function normalizePathname(pathname: string): string {
  const normalizedPathname = path.normalize(pathname)
  const normalizedLength = normalizedPathname.length
  if (normalizedPathname[normalizedLength - 1] === '/') {
    return normalizedPathname.slice(0, normalizedLength - 1)
  }
  return normalizedPathname
}

export function normalizeLocation({ pathname, ...otherProps }: Location) {
  return {
    pathname: normalizePathname(pathname),
    ...otherProps,
  }
}

export function getQueryMap() {
  const parsedQuery = querystring.parse(location.search.slice(1))
  const queryMap = Object.entries(parsedQuery).reduce<Map<string, string>>(
    (map, [key, value]) => {
      if (typeof value === 'string') {
        map.set(key, value)
      } else if (typeof value[0] === 'string') {
        map.set(key, value[0])
      }
      return map
    },
    new Map()
  )

  return queryMap
}
