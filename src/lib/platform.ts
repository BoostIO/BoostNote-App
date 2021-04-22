import isElectron from 'is-electron'
import { openExternal } from './electronOnly'
export { osName } from '../shared/lib/platform'

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
