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
