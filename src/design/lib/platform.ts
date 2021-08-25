export type OsNameOptions =
  | 'windows'
  | 'macos'
  | 'unix'
  | 'linux'
  | 'unknown'
  | 'ios'
  | 'android'

function getOsName(): OsNameOptions {
  if (navigator.userAgent.indexOf('Android') != -1) return 'android'
  if (navigator.userAgent.indexOf('iPhone') != -1) return 'ios'
  if (navigator.userAgent.indexOf('Win') != -1) return 'windows'
  if (navigator.userAgent.indexOf('Mac') != -1) return 'macos'
  if (navigator.userAgent.indexOf('X11') != -1) return 'unix'
  if (navigator.userAgent.indexOf('Linux') != -1) return 'linux'

  return 'unknown'
}

export const osName = getOsName()
