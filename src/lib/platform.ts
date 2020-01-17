import isElectron from 'is-electron'

declare function $openExternal(url: string): void

export const openNew = (url: string) => {
  if (isElectron()) {
    if (url.length > 0) {
      $openExternal(url)
    }
  } else {
    window.open(url, '_blank')
  }
}

export type OsNameOptions = 'windows' | 'macos' | 'unix' | 'linux' | 'unknown'

function getOsName(): OsNameOptions {
  if (navigator.appVersion.indexOf('Win') != -1) return 'windows'
  if (navigator.appVersion.indexOf('Mac') != -1) return 'macos'
  if (navigator.appVersion.indexOf('X11') != -1) return 'unix'
  if (navigator.appVersion.indexOf('Linux') != -1) return 'linux'

  return 'unknown'
}

export const osName = getOsName()
