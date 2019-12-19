export function downloadString(
  content: string,
  fileName: string,
  type = 'text/plain'
) {
  const anchor = document.createElement('a')
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.href = window.URL.createObjectURL(new Blob([content], { type }))
  anchor.setAttribute('download', fileName)
  anchor.click()
  window.URL.revokeObjectURL(anchor.href)
  document.body.removeChild(anchor)
}

export function downloadBlob(blob: Blob, fileName: string) {
  const anchor = document.createElement('a')
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.href = window.URL.createObjectURL(blob)
  anchor.setAttribute('download', fileName)
  anchor.click()
  window.URL.revokeObjectURL(anchor.href)
  document.body.removeChild(anchor)
}

export function getAppLinkFromUserAgent() {
  const userAgent = navigator.userAgent
  const download = {
    os: '',
    link: ''
  }

  if (userAgent.indexOf('Windows') != -1) {
    download.os = 'Windows'
    download.link =
      'https://github.com/BoostIO/BoostNote.next/releases/latest/download/boost-note-win.exe'
  }
  if (userAgent.indexOf('Mac') != -1) {
    download.os = 'Mac'
    download.link =
      'https://github.com/BoostIO/BoostNote.next/releases/latest/download/boost-note-mac.dmg'
  }
  if (userAgent.indexOf('Linux') != -1) {
    download.os = 'Linux'
    download.link =
      'https://github.com/BoostIO/BoostNote.next/releases/latest/download/boost-note-linux.deb'
  }
  return download
}
