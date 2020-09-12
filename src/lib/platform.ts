import isElectron from 'is-electron'
import { openExternal } from './electronOnly'

export const appIsElectron = isElectron()

const isInternalLink = (link: string) => link[0] === '#'

const openInternalLink = (link: string) => {
  const extractedId = link.slice(1)
  const targetId = `user-content-${extractedId}`
  const targetElement = window.document.getElementById(targetId)
  if (targetElement != null) {
    targetElement.scrollIntoView()
  }
}

export const openNew = (url: string) => {
  if (url.length === 0) {
    return
  }

  if (isInternalLink(url)) {
    openInternalLink(url)
    return
  }

  if (appIsElectron) {
    openExternal(url)
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
