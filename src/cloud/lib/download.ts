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

export function printIframe(content: string, fileName: string) {
  const previousFrame = document.getElementById('iframe-print')
  if (previousFrame) previousFrame.parentNode?.removeChild(previousFrame)
  const frame = document.createElement('iframe')
  frame.id = 'iframe-print'
  frame.name = 'iframe-print'
  frame.src = 'about:blank'
  frame.style.display = 'none'
  frame.title = fileName
  frame.srcdoc = content
  document.body.appendChild(frame)
  const iframe = window.frames['iframe-print']
  if (iframe == null) {
    return
  }
  iframe.focus()
  iframe.print()
}
