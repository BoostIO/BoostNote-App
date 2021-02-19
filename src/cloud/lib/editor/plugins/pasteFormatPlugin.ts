interface Position {
  left: number
  top: number
  bottom: number
}

export interface PositionRange {
  from: Position
  to: Position
}

export type Callback = (convert: boolean) => void

interface Config {
  openMenu: (position: PositionRange, callback: Callback) => void
  closeMenu: () => void
  formatter: (pasted: string) => string | null
}

export const pasteFormatPlugin = (
  editor: CodeMirror.Editor,
  { openMenu, closeMenu, formatter }: Config
) => {
  let open = false
  const close = () => {
    if (open) {
      closeMenu()
      open = false
    }
  }

  editor.on('mousedown', close)
  editor.on('change', close)
  editor.on('keydown', (_editor, event) => {
    if (event.key === 'Esc' || event.key === 'Escape') {
      close()
    }
  })
  editor.on('blur', () => {
    setTimeout(() => {
      close()
    }, 100)
  })

  editor.on('inputRead', (editorInstance, change) => {
    closeMenu()
    if (change.origin !== 'paste') {
      return
    }

    if (change.text.length !== 1) {
      return
    }

    const replacement = formatter(change.text[0])
    if (replacement === null) {
      return
    }

    const to = editorInstance.getCursor()

    const callback: Callback = (convert) => {
      if (convert) {
        editorInstance.replaceRange(replacement, change.from, to)
      }
      close()
    }

    const posRange = {
      from: editorInstance.charCoords(change.from, 'local'),
      to: editorInstance.cursorCoords(true, 'local'),
    }
    openMenu(posRange, callback)
    open = true
  })
}
