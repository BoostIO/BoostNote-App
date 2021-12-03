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

type FormatterResult = {
  replacement: string | null
  promptMenu: boolean
}

interface Config {
  openMenu: (position: PositionRange, callback: Callback) => void
  closeMenu: () => void
  formatter: (pasted: string[]) => FormatterResult
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

    const { replacement, promptMenu } = formatter(change.text)

    if (replacement === null) {
      return
    }

    const to = editorInstance.getCursor()

    // do replacement without menu
    if (promptMenu === false) {
      editorInstance.replaceRange(replacement, change.from, to)
      return
    }

    const posRange = {
      from: editorInstance.charCoords(change.from, 'local'),
      to: editorInstance.cursorCoords(true, 'local'),
    }
    const callback: Callback = (convert) => {
      if (convert) {
        editorInstance.replaceRange(replacement, change.from, to)
      }
      close()
    }

    openMenu(posRange, callback)
    open = true
  })
}
