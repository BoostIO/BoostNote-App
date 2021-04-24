import React from 'react'
import {
  NoteDoc,
  NoteDocEditibleProps,
  Attachment,
  NoteStorage,
} from '../../lib/db/types'
import CustomizedCodeEditor from '../atoms/CustomizedCodeEditor'
import CustomizedMarkdownPreviewer from '../atoms/CustomizedMarkdownPreviewer'
import { ViewModeType } from '../../lib/generalStatus'
import {
  convertItemListToArray,
  inspectDataTransfer,
  convertFileListToArray,
} from '../../lib/dom'
import CodeMirror, { EditorPosition } from '../../lib/CodeMirror'
import EditorSelectionStatus from '../molecules/EditorSelectionStatus'
import EditorIndentationStatus from '../molecules/EditorIndentationStatus'
import EditorThemeSelect from '../molecules/EditorThemeSelect'
import EditorKeyMapSelect from '../molecules/EditorKeyMapSelect'
import { addIpcListener, removeIpcListener } from '../../lib/electronOnly'
import { Position } from 'codemirror'
import LocalSearch from './LocalSearch'
import { SearchReplaceOptions } from '../../lib/search/search'
import {
  borderTop,
  backgroundColor,
  borderRight,
} from '../../shared/lib/styled/styleFunctions'
import styled from '../../shared/lib/styled'

type NoteDetailProps = {
  note: NoteDoc
  storage: NoteStorage
  updateNote: (
    storageId: string,
    noteId: string,
    props: Partial<NoteDocEditibleProps>
  ) => Promise<void | NoteDoc>
  viewMode: ViewModeType
  initialCursorPosition: EditorPosition
  addAttachments(storageId: string, files: File[]): Promise<Attachment[]>
}

type NoteDetailState = {
  prevStorageId: string
  prevNoteId: string
  content: string
  currentCursor: EditorPosition
  searchOptions: SearchReplaceOptions
  showSearch: boolean
  showReplace: boolean
  searchQuery: string
  replaceQuery: string
  currentSelections: {
    head: EditorPosition
    anchor: EditorPosition
  }[]
}

class NoteDetail extends React.Component<NoteDetailProps, NoteDetailState> {
  state: NoteDetailState = {
    prevStorageId: '',
    prevNoteId: '',
    content: '',
    currentCursor: {
      line: 0,
      ch: 0,
    },
    searchOptions: {
      regexSearch: false,
      caseSensitiveSearch: false,
      preservingCaseReplace: false,
    },
    showSearch: false,
    showReplace: false,
    searchQuery: '',
    replaceQuery: '',
    currentSelections: [
      {
        head: {
          line: 0,
          ch: 0,
        },
        anchor: {
          line: 0,
          ch: 0,
        },
      },
    ],
  }
  codeMirror?: CodeMirror.EditorFromTextArea

  codeMirrorRef = (codeMirror: CodeMirror.EditorFromTextArea) => {
    this.codeMirror = codeMirror

    // Update cursor if needed
    if (this.props.initialCursorPosition) {
      this.codeMirror.focus()
      this.codeMirror.setCursor(this.props.initialCursorPosition)
    }
  }

  static getDerivedStateFromProps(
    props: NoteDetailProps,
    state: NoteDetailState
  ): NoteDetailState {
    const { note, storage } = props
    if (storage.id !== state.prevStorageId || note._id !== state.prevNoteId) {
      return {
        prevStorageId: storage.id,
        prevNoteId: note._id,
        content: note.content,
        currentCursor: {
          line: props.initialCursorPosition
            ? props.initialCursorPosition.line
            : 0,
          ch: props.initialCursorPosition ? props.initialCursorPosition.ch : 0,
        },
        searchOptions: {
          regexSearch: false,
          caseSensitiveSearch: false,
          preservingCaseReplace: false,
        },
        showSearch: false,
        showReplace: false,
        searchQuery: '',
        replaceQuery: '',
        currentSelections: [
          {
            head: {
              line: 0,
              ch: 0,
            },
            anchor: {
              line: 0,
              ch: 0,
            },
          },
        ],
      }
    }
    return state
  }

  componentDidUpdate(_prevProps: NoteDetailProps, prevState: NoteDetailState) {
    const { note } = this.props
    if (prevState.prevNoteId !== note._id) {
      if (this.queued) {
        const { content } = prevState
        this.saveNote(prevState.prevStorageId, prevState.prevNoteId, {
          content,
        })
      }
    }
  }

  focusOnEditor = () => {
    if (this.codeMirror == null) {
      return
    }
    this.codeMirror.focus()
  }

  componentDidMount() {
    addIpcListener('focus-editor', this.focusOnEditor)
    addIpcListener('apply-bold-style', this.applyBoldStyle)
    addIpcListener('apply-italic-style', this.applyItalicStyle)
  }

  componentWillUnmount() {
    if (this.queued) {
      const { content, prevStorageId, prevNoteId } = this.state
      this.saveNote(prevStorageId, prevNoteId, {
        content,
      })
    }
    removeIpcListener('focus-editor', this.focusOnEditor)
    removeIpcListener('apply-bold-style', this.applyBoldStyle)
    removeIpcListener('apply-italic-style', this.applyItalicStyle)
  }

  updateContent = (
    newValueOrUpdater: string | ((prevValue: string) => string)
  ) => {
    const updater =
      typeof newValueOrUpdater === 'string'
        ? () => newValueOrUpdater
        : newValueOrUpdater
    this.setState(
      (prevState) => {
        return {
          content: updater(prevState.content),
        }
      },
      () => {
        this.queueToSave()
      }
    )
  }

  executeSaveQueue = async () => {
    const { note, storage } = this.props

    if (this.queued) {
      const { content } = this.state
      await this.saveNote(storage.id, note._id, {
        content,
      })
    }
  }

  queued = false
  timer?: any

  queueToSave = () => {
    this.queued = true
    if (this.timer != null) {
      clearTimeout(this.timer)
    }
    this.timer = setTimeout(() => {
      const { note, storage } = this.props
      const { content } = this.state

      this.saveNote(storage.id, note._id, {
        content,
      })
    }, 3000)
  }

  async saveNote(
    storageId: string,
    noteId: string,
    { content }: { content: string }
  ) {
    clearTimeout(this.timer)
    this.queued = false

    const { updateNote } = this.props
    await updateNote(storageId, noteId, {
      content,
    })
  }

  refreshCodeEditor = () => {
    if (this.codeMirror != null) {
      this.codeMirror.refresh()
    }
  }

  handleDrop = async (codeMirror: CodeMirror.Editor, event: DragEvent) => {
    event.preventDefault()

    if (event.dataTransfer == null) {
      return
    }

    inspectDataTransfer(event.dataTransfer)

    const { storage, addAttachments } = this.props
    const files = convertFileListToArray(
      event.dataTransfer.files
    ).filter((file) => file.type.startsWith('image/'))

    if (files.length === 0) {
      return
    }

    const attachments = await addAttachments(storage.id, files)

    const coords = codeMirror.coordsChar({
      left: event.x,
      top: event.y,
    })
    codeMirror.getDoc().replaceRange(
      attachments
        .map((attachment) => {
          return `![](${attachment.name})`
        })
        .join(' '),
      coords
    )
  }

  handlePaste = async (
    codeMirror: CodeMirror.Editor,
    event: ClipboardEvent
  ) => {
    const { clipboardData } = event
    if (clipboardData == null) {
      return
    }

    inspectDataTransfer(clipboardData)

    const items = convertItemListToArray(clipboardData.items)
    const imageItems = items.filter((item) => {
      return item.kind === 'file' && item.type.startsWith('image/')
    })
    if (imageItems.length === 0) {
      return
    }

    event.preventDefault()
    const { storage, addAttachments } = this.props

    const imageFiles = imageItems.reduce<File[]>((files, item) => {
      const file = item.getAsFile()
      if (file != null) {
        files.push(file)
      }
      return files
    }, [])

    const attachments = await addAttachments(storage.id, imageFiles)

    codeMirror.getDoc().replaceSelection(
      attachments
        .map((attachment) => {
          return `![](${attachment.name})`
        })
        .join(' ')
    )
  }

  handleCursorActivity = (codeMirror: CodeMirror.Editor) => {
    const doc = codeMirror.getDoc()
    const { line, ch } = doc.getCursor()
    const selections = doc.listSelections()

    this.setState({
      currentCursor: {
        line,
        ch,
      },
      currentSelections: selections,
    })
  }

  updateSearchReplaceOptions = (options: Partial<SearchReplaceOptions>) => {
    this.setState((prevState) => {
      return {
        searchOptions: {
          ...prevState.searchOptions,
          ...options,
        },
      }
    })
  }

  toggleSearchReplace = (showReplace?: boolean, editor?: CodeMirror.Editor) => {
    if (showReplace) {
      this.toggleSearch(true, editor)
    }
    this.setState((prevState) => {
      return {
        showReplace: showReplace != null ? showReplace : !prevState.showReplace,
      }
    })
  }

  toggleSearch = (
    showSearch: boolean,
    editor?: CodeMirror.Editor,
    searchOnly = false
  ) => {
    if (showSearch && this.state.showSearch) {
      // Focus search again
      this.setState(() => {
        return {
          showSearch: false,
        }
      })
    }

    if (showSearch && editor != null && editor.getSelection() !== '') {
      // fetch selected range to input into search box
      this.setState(() => {
        return {
          searchQuery: editor.getSelection(),
        }
      })
    }
    if (editor != null && !showSearch) {
      // Clear marks if any
      editor.getAllMarks().forEach((mark) => mark.clear())
    }
    this.setState(
      (prevState) => {
        return {
          showSearch: showSearch != null ? showSearch : !prevState.showSearch,
        }
      },
      () => {
        if (!this.state.showSearch || searchOnly) {
          this.toggleSearchReplace(false)
        }
      }
    )
  }

  handleOnReplaceQueryChange = (newReplaceQuery: string) => {
    if (this.state.replaceQuery !== newReplaceQuery) {
      this.setState(() => {
        return {
          replaceQuery: newReplaceQuery,
        }
      })
    }
  }

  handleOnSearchQueryChange = (newSearchQuery: string) => {
    if (this.state.searchQuery !== newSearchQuery) {
      this.setState(() => {
        return {
          searchQuery: newSearchQuery,
        }
      })
    }
  }

  applyBoldStyle = () => {
    const codeMirror = this.codeMirror
    if (codeMirror == null) {
      return
    }
    if (!codeMirror.hasFocus()) {
      return
    }
    this.format('bold')
  }

  applyItalicStyle = () => {
    const codeMirror = this.codeMirror
    if (codeMirror == null) {
      return
    }
    if (!codeMirror.hasFocus()) {
      return
    }
    this.format('italic')
  }

  format = (format: FormattingTool) => {
    const codeMirror = this.codeMirror
    if (codeMirror == null) {
      return
    }

    const useSelection = codeMirror.somethingSelected()
    let word = codeMirror.getSelection()
    let wordRange: { anchor: Position; head?: Position } | undefined
    const cursorPosition = codeMirror.getCursor()

    if (!useSelection) {
      const contentAfter = getCursivePositionAndString(
        codeMirror,
        codeMirror.getCursor(),
        1
      )

      if (contentAfter.val === '') {
        wordRange = {
          anchor: contentAfter.pos,
          head: undefined,
        }
      } else {
        const contentBefore = getCursivePositionAndString(
          codeMirror,
          codeMirror.getCursor(),
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
      codeMirror,
      useSelection,
      { word, cursorPosition, wordRange },
      formattingOptions
    )
  }

  render() {
    const { note, storage, viewMode, initialCursorPosition } = this.props
    const { currentCursor, currentSelections } = this.state

    const codeEditor = (
      <CustomizedCodeEditor
        className='editor'
        key={note._id + initialCursorPosition.line}
        codeMirrorRef={this.codeMirrorRef}
        value={this.state.content}
        onChange={this.updateContent}
        onPaste={this.handlePaste}
        onDrop={this.handleDrop}
        onCursorActivity={this.handleCursorActivity}
        onLocalSearchToggle={(editor, showLocalSearch) =>
          this.toggleSearch(showLocalSearch, editor, true)
        }
        onLocalSearchReplaceToggle={(editor, showLocalReplace) =>
          this.toggleSearchReplace(showLocalReplace, editor)
        }
      />
    )

    const markdownPreviewer = (
      <CustomizedMarkdownPreviewer
        content={this.state.content}
        attachmentMap={storage.attachmentMap}
        updateContent={this.updateContent}
      />
    )

    return (
      <Container>
        {viewMode !== 'preview' &&
          this.state.showSearch &&
          this.codeMirror != null && (
            <SearchBarContainer
              className={viewMode === 'split' ? 'halfWidth' : ''}
            >
              <LocalSearch
                key={this.state.showReplace + ''}
                searchQuery={this.state.searchQuery}
                replaceQuery={this.state.replaceQuery}
                searchOptions={this.state.searchOptions}
                codeMirror={this.codeMirror}
                showingReplace={this.state.showReplace}
                onSearchToggle={this.toggleSearch}
                onCursorActivity={this.handleCursorActivity}
                onSearchQueryChange={this.handleOnSearchQueryChange}
                onReplaceToggle={this.toggleSearchReplace}
                onReplaceQueryChange={this.handleOnReplaceQueryChange}
                onUpdateSearchOptions={this.updateSearchReplaceOptions}
              />
            </SearchBarContainer>
          )}
        <ContentSection>
          {viewMode === 'preview' ? (
            markdownPreviewer
          ) : viewMode === 'split' ? (
            <>
              <div className='splitLeft'>{codeEditor}</div>
              <div className='splitRight'>{markdownPreviewer}</div>
            </>
          ) : (
            codeEditor
          )}
        </ContentSection>
        <div className='bottomBar'>
          <EditorSelectionStatus
            cursor={currentCursor}
            selections={currentSelections}
          />
          <EditorKeyMapSelect />
          <EditorThemeSelect />
          <EditorIndentationStatus />
        </div>
      </Container>
    )
  }
}

export default NoteDetail

const Container = styled.div`
  ${backgroundColor};
  display: flex;
  flex-direction: column;
  height: 100%;
  & > .bottomBar {
    ${backgroundColor};
    display: flex;
    ${borderTop};
    height: 24px;
    & > :first-child {
      flex: 1;
    }
    z-index: 5001;
  }

  overflow: hidden;
`

const SearchBarContainer = styled.div`
  width: 100%;
  &.halfWidth {
    width: 50%;
  }
`

const ContentSection = styled.div`
  flex: 1;
  overflow: hidden;
  position: relative;

  .editor .CodeMirror {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
  }

  .MarkdownPreviewer {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    padding: 10px 10px;
    box-sizing: border-box;
  }
  .splitLeft {
    position: absolute;
    width: 50%;
    height: 100%;
    ${borderRight}
  }
  .splitRight {
    position: absolute;
    left: 50%;
    width: 50%;
    height: 100%;
  }
`

type FormattingTool =
  | 'header1'
  | 'header2'
  | 'header3'
  | 'header4'
  | 'header5'
  | 'header6'
  | 'bold'
  | 'italic'
  | 'quote'
  | 'code'
  | 'bulletedList'
  | 'numberedList'
  | 'taskList'
  | 'link'
  | 'codefence'

const spaceRegex = /^$|\s+/

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
