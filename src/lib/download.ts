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
