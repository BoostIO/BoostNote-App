import { boostHubBaseUrl } from '../../consts'

export type OnFileCallback = (file: File) => Promise<FileNode | null>

type FileNode =
  | { type: 'img'; url: string; alt?: string; title?: string }
  | { type: 'file'; url: string; title?: string }

interface FileHandlerConfig {
  onFile: OnFileCallback
  buildWidget?: (file: File) => HTMLElement
  lineClass?: string
}

const attachFileHandlerToCodeMirrorEditor = (
  editor: CodeMirror.Editor,
  {
    onFile,
    buildWidget = buildDefaultUploadWidget,
    lineClass = 'file-loading',
  }: FileHandlerConfig
) => {
  const handler = async (pos: CodeMirror.Position, file: File) => {
    const fileNodePromise = onFile(file)
    editor.addLineClass(pos.line, 'wrap', lineClass)
    const widget = buildWidget(file)
    editor.addWidget(pos, widget, false)
    const fileNode = await fileNodePromise
    if (widget.parentNode != null) {
      widget.parentNode.removeChild(widget)
    }
    if (fileNode != null) {
      editor.replaceRange(
        `${pos.ch !== 0 ? `\n` : ''}${stringifyFileNode(fileNode)}\n`,
        pos
      )
      const newCursorPos = {
        ch: 0,
        line: pos.ch !== 0 ? pos.line + 2 : pos.line + 1,
      }
      editor.setCursor(newCursorPos)
    }
  }

  editor.on('drop', async (instance: CodeMirror.Editor, event) => {
    if (event.dataTransfer != null && event.dataTransfer.files.length > 0) {
      event.stopPropagation()
      event.preventDefault()
      const pos = instance.coordsChar({ left: event.pageX, top: event.pageY })
      const files = event.dataTransfer.files
      for (let i = 0; i < files.length; i++) {
        await handler(i > 0 ? instance.getCursor() : pos, files[i])
      }
    }
  })
  ;(editor as any).on(
    'paste',
    async (instance: CodeMirror.Editor, event: ClipboardEvent) => {
      if (event.clipboardData != null && event.clipboardData.files.length > 0) {
        event.stopPropagation()
        event.preventDefault()
        const pos = instance.getCursor()
        const files = event.clipboardData.files
        for (let i = 0; i < files.length; i++) {
          await handler(i > 0 ? instance.getCursor() : pos, files[i])
        }
      }
    }
  )

  return editor
}

export const buildDefaultUploadWidget = (file: File) => {
  const widget = document.createElement('div')
  const fileIsImage = file.type.match(/image\/.*/)
  widget.appendChild(
    document.createTextNode(
      `${fileIsImage ? '!' : ''}[Uploading... ${file.name}]()`
    )
  )
  widget.style.position = 'absolute'
  widget.classList.add('file-loading-widget')
  return widget
}

export const stringifyFileNode = (fileNode: FileNode) => {
  switch (fileNode.type) {
    case 'file': {
      const { url, title = '' } = fileNode
      return `[${title}](${boostHubBaseUrl + encodeURI(url)})`
    }
    case 'img': {
      const { url, alt = '', title } = fileNode
      return `![${alt}](${boostHubBaseUrl + encodeURI(url)}${
        title != null ? ` "${title}"` : ''
      })`
    }
  }
}

export default attachFileHandlerToCodeMirrorEditor
