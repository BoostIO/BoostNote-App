import { decodeResponse, isImageResponse } from '../http'

const handlePasteText = (
  doc: CodeMirror.Doc,
  change: CodeMirror.EditorChange,
  pastedText: string
) => {
  doc.replaceRange(pastedText, change.from, {
    line: change.from.line,
    ch: change.from.ch + pastedText.length,
  })
}

const handlePasteUrl = async (doc: CodeMirror.Doc, change: CodeMirror.EditorChange, pastedText: string) => {
  const taggedUrl = `<${pastedText}>`
  const urlToFetch = pastedText
  const titleMark = ''

  doc.replaceRange(taggedUrl, change.from, {
    line: change.from.line,
    ch: change.from.ch + pastedText.length,
  })

  const replaceTaggedUrl = (replacement: string) => {
    const value = doc.getValue()
    const cursor = doc.getCursor()
    const newValue = value.replace(taggedUrl, titleMark + replacement)
    const newCursor = Object.assign({}, cursor, {
      ch: cursor.ch + newValue.length - (value.length - titleMark.length),
    })

    doc.setValue(newValue)
    doc.setCursor(newCursor)
  }

  const response = await fetch(urlToFetch, { method: 'get' })
  let replacement = pastedText
  if (!isImageResponse(response)) {
    replacement = await mapNormalResponse(response, urlToFetch)
  }
  replaceTaggedUrl(replacement)
}

const mapNormalResponse = async (response: Response, pastedTxt: string) => {
  const body = await decodeResponse(response)
  try {
    const escapePipe = (str: string) => str.replace('|', '\\|')
    const parsedBody = new window.DOMParser().parseFromString(body, 'text/html')
    return `[${escapePipe(parsedBody.title)}](${pastedTxt})`
  } catch (e) {
    console.log(e)
  }
  return ''
}

export const codeMirrorPasteHandler = (
  editor: CodeMirror.Editor,
  change: CodeMirror.EditorChange,
  enableAutoFetchWebPageTitle: boolean
) => {
  if (!enableAutoFetchWebPageTitle) return
  const editorDoc = editor.getDoc()

  const isUrl = (str: string) => {
    return /(?:^\w+:|^)\/\/(?:[^\s\.]+\.\S{2}|localhost[\:?\d]*)/.test(str)
  }

  const isInLinkTag = (doc: CodeMirror.Doc) => {
    const startCursor = doc.getCursor('start')
    const prevChar = doc.getRange(
      {
        line: startCursor.line,
        ch: startCursor.ch - 2,
      },
      {
        line: startCursor.line,
        ch: startCursor.ch,
      }
    )
    const endCursor = doc.getCursor('end')
    const nextChar = doc.getRange(
      {
        line: endCursor.line,
        ch: endCursor.ch,
      },
      {
        line: endCursor.line,
        ch: endCursor.ch + 1,
      }
    )
    return prevChar === '](' && nextChar === ')'
  }

  const isInFencedCodeBlock = (editor: CodeMirror.Editor) => {
    const doc = editor.getDoc()
    const cursor = doc.getCursor()

    let token = editor.getTokenAt(cursor)
    if (token.state.fencedState) {
      return true
    }

    let line = cursor.line - 1
    while (line >= 0) {
      token = editor.getTokenAt({
        ch: 3,
        line,
      })

      if (token.start === token.end) {
        --line
      } else if (token.type === 'comment') {
        if (line > 0) {
          token = editor.getTokenAt({
            ch: 3,
            line: line - 1,
          })

          return token.type !== 'comment'
        } else {
          return true
        }
      } else {
        return false
      }
    }

    return false
  }

  const pastedText = change.text[0]
  if (isInFencedCodeBlock(editor)) {
    handlePasteText(editorDoc, change, pastedText)
  } else if (isUrl(pastedText) && !isInLinkTag(editorDoc)) {
    handlePasteUrl(editorDoc, change, pastedText)
  } else {
    handlePasteText(editorDoc, change, pastedText)
  }
}
