export const isElectron = () => navigator.userAgent.indexOf('Electron') >= 0

export const openNew = (url: string) => {
  if (isElectron()) {
    // electron implementation
  } else {
    window.open(url, '_blank')
  }
}
