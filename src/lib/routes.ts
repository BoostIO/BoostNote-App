import pathToRegexp from 'path-to-regexp'

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
