import path from 'path'
import pathToRegexp from 'path-to-regexp'
import { Location } from './types'
import { parse as _parseUrl } from 'url'

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
    ...otherProps
  }
}

export const storageRegexp = pathToRegexp(
  '/storages/:storageName/:rest*',
  undefined,
  {
    sensitive: true
  }
)

export const folderRegexp = pathToRegexp(
  '/storages/:storageName/notes/:rest*',
  undefined,
  {
    sensitive: true
  }
)

export const tagRegexp = pathToRegexp(
  '/storages/:storageName/tags/:tag',
  undefined,
  {
    sensitive: true
  }
)

export function parseUrl(urlStr: string): Location {
  const url = _parseUrl(urlStr, true)
  return {
    pathname: url.pathname || '',
    hash: url.hash || '',
    query: url.query
  }
}
