import isElectron from 'is-electron'
import { UAParser } from 'ua-parser-js'

declare function $openExternal(url: string): void

export const openNew = (url: string) => {
  if (url.length === 0) {
    return
  }

  if (typeof $openExternal === 'undefined') {
    window.open(url, '_blank')
    return
  }
  $openExternal(url)
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

export const isDesktopOrMobileApp = () => {
  if (isElectron()) {
    // desktop app
    return true
  }
  const userAgent = window.navigator.userAgent.toLowerCase()
  const safari = /safari/.test(userAgent)
  const ios = /iphone|ipod|ipad/.test(userAgent)
  if (ios && !safari) {
    // webview(ios)
    return true
  }
  const browserName = new UAParser(navigator.userAgent).getBrowser().name
  if (browserName !== undefined && browserName.indexOf('WebView') != -1) {
    // webview(android)
    return true
  }
  return false
}