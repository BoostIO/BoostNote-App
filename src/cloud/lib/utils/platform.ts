export const openNew = (url: string) => {
  window.open(url, '_blank')
}

export const isBrowser = () => {
  try {
    const userAgentString = navigator.userAgent
    return (
      userAgentString.indexOf('Chrome') > -1 ||
      userAgentString.indexOf('MSIE') > -1 ||
      userAgentString.indexOf('rv:') > -1 ||
      userAgentString.indexOf('Firefox') > -1 ||
      userAgentString.indexOf('Safari') > -1 ||
      userAgentString.indexOf('OP') > -1
    )
  } catch (error) {
    return false
  }
}

export type OsNameOptions = 'windows' | 'macos' | 'unix' | 'linux' | 'unknown'

export const getOsName = (): OsNameOptions => {
  try {
    if (navigator.appVersion.indexOf('Win') != -1) return 'windows'
    if (navigator.appVersion.indexOf('Mac') != -1) return 'macos'
    if (navigator.appVersion.indexOf('X11') != -1) return 'unix'
    if (navigator.appVersion.indexOf('Linux') != -1) return 'linux'

    return 'unknown'
  } catch (error) {
    return 'unknown'
  }
}

export const osFromAgentString = (agent: string): OsNameOptions => {
  if (agent.indexOf('Win') != -1) return 'windows'
  if (agent.indexOf('Mac') != -1) return 'macos'
  if (agent.indexOf('X11') != -1) return 'unix'
  if (agent.indexOf('Linux') != -1) return 'linux'
  return 'unknown'
}

export const osName = getOsName()
