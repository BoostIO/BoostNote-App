import React, { useCallback, useEffect } from 'react'
import { SerializedDocWithBookmark } from '../../../interfaces/db/doc'
import { SerializedTeam } from '../../../interfaces/db/team'
import {
  mdiFormatBold,
  mdiFormatItalic,
  mdiFormatQuoteClose,
  mdiCodeTags,
  mdiLinkVariant,
  mdiFormatListBulleted,
  mdiFormatListNumbered,
  mdiCheckboxMarkedOutline,
  mdiFormatHeaderPound,
  mdiCodeNotEqualVariant,
} from '@mdi/js'
import { Position } from 'codemirror'
import EditorToolButton from './EditorToolButton'
import { StyledEditorToolList } from './styled'
import EditorToolHeaderDropdown from './EditorHeaderTool'
import { FormattingTool } from './types'
import EditorIntegrationToolButton from './EditorIntegrationToolButton'
import {
  applyBoldStyleEventEmitter,
  applyItalicStyleEventEmitter,
} from '../../../lib/utils/events'

interface EditorToolbarProps {
  currentDoc: SerializedDocWithBookmark
  team: SerializedTeam
  editorRef?: React.MutableRefObject<CodeMirror.Editor | null>
}

const spaceRegex = /^$|\s+/

const EditorToolbar = ({ editorRef }: EditorToolbarProps) => {
  const onFormatCallback = useCallback(
    (format: FormattingTool) => {
      if (editorRef == null || editorRef.current == null) {
        return
      }

      const useSelection = editorRef.current.somethingSelected()
      let word = editorRef.current.getSelection()
      let wordRange: { anchor: Position; head?: Position } | undefined
      const cursorPosition = editorRef.current.getCursor()

      if (!useSelection) {
        const contentAfter = getCursivePositionAndString(
          editorRef.current,
          editorRef.current.getCursor(),
          1
        )

        if (contentAfter.val === '') {
          wordRange = {
            anchor: contentAfter.pos,
            head: undefined,
          }
        } else {
          const contentBefore = getCursivePositionAndString(
            editorRef.current,
            editorRef.current.getCursor(),
            -1
          )

          wordRange = {
            anchor: contentBefore.pos,
            head: contentAfter.pos,
          }
          word = contentBefore.val + contentAfter.val
        }
      }

      let formattingOptions: FormattingBehaviour | undefined
      switch (format) {
        case 'bold':
          formattingOptions = { markerLeft: '**', markerRight: '**' }
          break
        case 'italic':
          formattingOptions = { markerLeft: '_', markerRight: '_' }
          break
        case 'header1':
          formattingOptions = { markerLeft: '# ' }
          break
        case 'header2':
          formattingOptions = { markerLeft: '## ' }
          break
        case 'header3':
          formattingOptions = { markerLeft: '### ' }
          break
        case 'header4':
          formattingOptions = { markerLeft: '#### ' }
          break
        case 'header5':
          formattingOptions = { markerLeft: '##### ' }
          break
        case 'header6':
          formattingOptions = { markerLeft: '###### ' }
          break
        case 'code':
          formattingOptions = { markerLeft: '`', markerRight: '`' }
          break
        case 'codefence':
          formattingOptions = {
            markerLeft: '```',
            markerRight: '```',
            breakLine: true,
          }
          break
        case 'link':
          formattingOptions = { markerLeft: '[', markerRight: '](url)' }
          break
        case 'quote':
          formattingOptions = { markerLeft: '> ', breakLine: true }
          break
        case 'bulletedList':
          formattingOptions = { markerLeft: '- ', breakLine: true }
          break
        case 'taskList':
          formattingOptions = { markerLeft: '- [ ] ', breakLine: true }
          break
        case 'numberedList':
          formattingOptions = { markerLeft: '1. ', breakLine: true }
          break
        default:
          break
      }

      if (formattingOptions == null) {
        return
      }

      replaceSelectionOrRange(
        editorRef.current,
        useSelection,
        { word, cursorPosition, wordRange },
        formattingOptions
      )
    },
    [editorRef]
  )

  const applyBoldStyle = useCallback(() => {
    onFormatCallback('bold')
  }, [onFormatCallback])

  useEffect(() => {
    applyBoldStyleEventEmitter.listen(applyBoldStyle)
    return () => {
      applyBoldStyleEventEmitter.unlisten(applyBoldStyle)
    }
  }, [applyBoldStyle])

  const applyItalicStyle = useCallback(() => {
    onFormatCallback('italic')
  }, [onFormatCallback])

  useEffect(() => {
    applyItalicStyleEventEmitter.listen(applyItalicStyle)
    return () => {
      applyItalicStyleEventEmitter.unlisten(applyItalicStyle)
    }
  }, [applyItalicStyle])

  return (
    <StyledEditorToolList>
      <EditorIntegrationToolButton />
      <EditorToolHeaderDropdown
        path={mdiFormatHeaderPound}
        tooltip='Add header text'
        onFormatCallback={onFormatCallback}
      />
      <EditorToolButton
        path={mdiCodeNotEqualVariant}
        tooltip='Insert a codefence'
        onClick={() => onFormatCallback('codefence')}
      />
      <EditorToolButton
        path={mdiFormatQuoteClose}
        tooltip='Insert a quote'
        onClick={() => onFormatCallback('quote')}
      />
      <EditorToolButton
        path={mdiFormatListBulleted}
        tooltip='Add a bulleted list'
        onClick={() => onFormatCallback('bulletedList')}
      />
      <EditorToolButton
        path={mdiFormatListNumbered}
        tooltip='Add a numbered list'
        onClick={() => onFormatCallback('numberedList')}
      />
      <EditorToolButton
        path={mdiCheckboxMarkedOutline}
        tooltip='Add a task list'
        style={{ marginRight: 20 }}
        onClick={() => onFormatCallback('taskList')}
      />
      <EditorToolButton
        path={mdiFormatBold}
        tooltip='Add bold text'
        onClick={applyBoldStyle}
      />
      <EditorToolButton
        path={mdiFormatItalic}
        tooltip='Add italic text'
        onClick={applyItalicStyle}
      />
      <EditorToolButton
        path={mdiCodeTags}
        tooltip='Insert code'
        onClick={() => onFormatCallback('code')}
      />
      <EditorToolButton
        path={mdiLinkVariant}
        tooltip='Add a link'
        onClick={() => onFormatCallback('link')}
      />
    </StyledEditorToolList>
  )
}

function getCursivePositionAndString(
  editor: CodeMirror.Editor,
  pos: Position,
  step: -1 | 1
): { pos: Position; val: string } {
  let onGoingSearch = true
  let maxPos: Position = pos
  let string = ''

  let nextPos = pos
  let prevPos = pos
  while (onGoingSearch) {
    if (step === 1) {
      prevPos = nextPos
      nextPos = { line: nextPos.line, ch: nextPos.ch + step }
    } else {
      nextPos = prevPos
      prevPos = { line: prevPos.line, ch: prevPos.ch + step }
    }
    const currentChar = editor.getRange(prevPos, nextPos, '\n')
    if (currentChar === '' || spaceRegex.test(currentChar)) {
      maxPos = step === 1 ? prevPos : nextPos
      onGoingSearch = false
      break
    }

    if (step === 1) {
      string += currentChar
    } else {
      string = currentChar + string
    }
  }

  return {
    pos: maxPos,
    val: string,
  }
}

function addOrRemoveFormat(
  word: string,
  markerLeft: string,
  markerRight: string,
  linebreaks: LineBreakTypes
) {
  if (word.startsWith(markerLeft) && word.endsWith(markerRight)) {
    const wordWithoutFormat = word.slice(
      markerLeft.length,
      word.length - markerRight.length
    )
    return {
      newVal: wordWithoutFormat,
      offset: -markerLeft.length,
    }
  }

  const replacement = feedlinebreaksToWord(
    linebreaks,
    word,
    markerLeft,
    markerRight
  )
  return {
    newVal: replacement,
    offset: markerLeft.length,
  }
}

function addOrRemoveStartingFormat(
  word: string,
  marker: string,
  linebreaks: LineBreakTypes
) {
  if (word.startsWith(marker)) {
    const wordWithoutFormat = word.slice(marker.length, word.length)
    return {
      newVal: wordWithoutFormat,
      offset: -marker.length,
      addBreakLines: false,
    }
  }

  const replacement = feedlinebreaksToWord(linebreaks, word, marker, undefined)

  return {
    newVal: replacement,
    offset: marker.length,
  }
}

type OriginalText = {
  word: string
  cursorPosition: Position
  wordRange?: { anchor: Position; head?: Position }
}

type FormattingBehaviour = {
  markerLeft: string
  markerRight?: string
  breakLine?: boolean
}

type LineBreakTypes = {
  beforeMark: number
  afterMark: number
  beforeWord: number
  afterWord: number
}

function feedlinebreaksToWord(
  linebreaks: LineBreakTypes,
  word: string,
  markerLeft: string,
  markerRight?: string
) {
  let replacement = ''
  for (let i = 0; i < linebreaks.beforeMark; i++) {
    replacement += `\n`
  }
  replacement += markerLeft

  for (let i = 0; i < linebreaks.beforeWord; i++) {
    replacement += `\n`
  }
  replacement += word

  for (let i = 0; i < linebreaks.afterWord; i++) {
    replacement += `\n`
  }

  if (markerRight == null) {
    return replacement
  }

  replacement += markerRight

  for (let i = 0; i < linebreaks.afterMark; i++) {
    replacement += `\n`
  }

  return replacement
}

function getLineBreaksFromFormat(
  editor: CodeMirror.Editor,
  anchor: Position,
  { markerRight, breakLine = false }: FormattingBehaviour
): LineBreakTypes {
  const linebreaks = {
    beforeMark: 0,
    afterMark: 0,
    beforeWord: 0,
    afterWord: 0,
  }

  if (!breakLine) {
    return linebreaks
  }

  if (anchor.ch !== 0) {
    linebreaks.beforeMark = 2
  } else {
    if (anchor.line !== 0) {
      const prevLine = editor.getLine(anchor.line - 1) || ''
      linebreaks.beforeMark = prevLine.trim() === '' ? 0 : 1
    }
  }

  const nextLine = editor.getLine(anchor.line + 1) || ''
  linebreaks.afterWord = nextLine.trim() === '' ? 0 : 1

  if (markerRight === '```') {
    linebreaks.beforeWord = 1
    linebreaks.afterMark = linebreaks.afterWord
    linebreaks.afterWord = 1
  }

  return linebreaks
}

function replaceSelectionOrRange(
  editor: CodeMirror.Editor,
  replaceSelection: boolean,
  { word, cursorPosition, wordRange }: OriginalText,
  { markerLeft, markerRight, breakLine = false }: FormattingBehaviour
) {
  editor.focus()
  if (replaceSelection) {
    const linebreaks = getLineBreaksFromFormat(
      editor,
      editor.getCursor('from'),
      {
        markerLeft,
        markerRight,
        breakLine,
      }
    )
    return handleSelectionReplace(
      editor,
      word,
      {
        markerLeft,
        markerRight,
        breakLine,
      },
      linebreaks
    )
  }

  if (wordRange == null) {
    return
  }

  const linebreaks = getLineBreaksFromFormat(editor, wordRange.anchor, {
    markerLeft,
    markerRight,
    breakLine,
  })

  const { newVal, offset } =
    markerRight != null
      ? addOrRemoveFormat(word, markerLeft, markerRight, linebreaks)
      : addOrRemoveStartingFormat(word, markerLeft, linebreaks)

  editor.replaceRange(newVal, wordRange.anchor, wordRange.head, word)
  const newLineCursor =
    breakLine && offset > 0
      ? linebreaks.beforeMark + linebreaks.beforeWord + cursorPosition.line
      : cursorPosition.line
  let newChCursor =
    breakLine && offset > 0 && linebreaks.beforeMark !== 0
      ? offset
      : cursorPosition.ch + offset

  if (linebreaks.beforeWord > 0) {
    newChCursor = 0
  }

  editor.setCursor({
    line: newLineCursor,
    ch: newChCursor,
  })
}

function handleSelectionReplace(
  editor: CodeMirror.Editor,
  selection: string,
  { markerLeft, markerRight }: FormattingBehaviour,
  linebreaks: LineBreakTypes
) {
  let newVal = selection
  const anchor = editor.getCursor('from')
  const head = editor.getCursor('to')
  if (head.ch === 0) {
    head.ch = (editor.getLine(head.line) || '').length
  }
  const markerRightOffset = markerRight != null ? markerRight?.length : 0
  const startPositionMinusMarkerLength = {
    line: anchor.line,
    ch: anchor.ch - markerLeft.length,
  }

  const endPositionPlusMarkerLength = {
    line: head.line,
    ch: head.ch + markerRightOffset,
  }

  let hasMarkerInside = false
  const hasMarkerOutside =
    markerRight != null
      ? editor.getRange(startPositionMinusMarkerLength, anchor) ===
          markerLeft &&
        editor.getRange(head, endPositionPlusMarkerLength) === markerRight
      : editor.getRange(startPositionMinusMarkerLength, anchor) === markerLeft

  if (hasMarkerOutside) {
    anchor.ch = anchor.ch - markerLeft.length
    head.ch = head.ch + markerRightOffset
  } else {
    const { newVal: replace, offset } =
      markerRight != null
        ? addOrRemoveFormat(selection, markerLeft, markerRight, linebreaks)
        : addOrRemoveStartingFormat(selection, markerLeft, linebreaks)
    newVal = replace
    hasMarkerInside = offset < 0
  }

  editor.replaceRange(newVal, anchor, head, selection)

  const selectionIsMultiline = anchor.line !== head.line
  const removingMarkers = hasMarkerOutside || hasMarkerInside

  const newSelectionAnchor = anchor
  const newSelectionHead = head

  if (selectionIsMultiline) {
    if (removingMarkers) {
      if (hasMarkerOutside) {
        anchor.ch = anchor.ch - markerLeft.length
      }
    } else {
      anchor.ch = anchor.ch + markerLeft.length
    }
  } else {
    if (removingMarkers) {
      if (hasMarkerOutside) {
        anchor.ch = anchor.ch - markerLeft.length
        head.ch = head.ch - markerLeft.length
      } else {
        head.ch = head.ch - markerLeft.length
      }
    } else {
      anchor.ch = anchor.ch + markerLeft.length
      head.ch = head.ch + markerLeft.length
    }
  }

  if (!removingMarkers) {
    anchor.line = anchor.line + linebreaks.beforeMark + linebreaks.beforeWord
    head.line = head.line + +linebreaks.beforeMark + linebreaks.beforeWord
  }

  if (linebreaks.beforeMark > 0 && !removingMarkers) {
    anchor.ch = markerLeft.length
    if (!selectionIsMultiline) {
      head.ch = selection.length + markerLeft.length
    }
  }

  if (linebreaks.beforeWord > 0) {
    anchor.ch = 0
    if (!selectionIsMultiline) {
      head.ch = selection.length
    }
  }

  editor.setSelection(newSelectionAnchor, newSelectionHead)
}

export default EditorToolbar
