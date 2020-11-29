import React from 'react'
import {
  NoteDoc,
  NoteDocEditibleProps,
  Attachment,
  NoteStorage,
} from '../../lib/db/types'
import styled from '../../lib/styled'
import CustomizedCodeEditor from '../atoms/CustomizedCodeEditor'
import CustomizedMarkdownPreviewer from '../atoms/CustomizedMarkdownPreviewer'
import { borderRight, backgroundColor } from '../../lib/styled/styleFunctions'
import { ViewModeType } from '../../lib/generalStatus'
import {
  convertItemListToArray,
  inspectDataTransfer,
  convertFileListToArray,
} from '../../lib/dom'

const StyledNoteDetailContainer = styled.div`
  ${backgroundColor};
  display: flex;
  flex-direction: column;
  height: 100%;
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

type NoteDetailProps = {
  note: NoteDoc
  storage: NoteStorage
  updateNote: (
    storageId: string,
    noteId: string,
    props: Partial<NoteDocEditibleProps>
  ) => Promise<void | NoteDoc>
  viewMode: ViewModeType
  addAttachments(storageId: string, files: File[]): Promise<Attachment[]>
}

type NoteDetailState = {
  prevStorageId: string
  prevNoteId: string
  title: string
  content: string
}

class NoteDetail extends React.Component<NoteDetailProps, NoteDetailState> {
  state: NoteDetailState = {
    prevStorageId: '',
    prevNoteId: '',
    title: '',
    content: '',
  }
  codeMirror?: CodeMirror.EditorFromTextArea
  codeMirrorRef = (codeMirror: CodeMirror.EditorFromTextArea) => {
    this.codeMirror = codeMirror
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
        title: note.title,
        content: note.content,
      }
    }
    return state
  }

  componentDidUpdate(_prevProps: NoteDetailProps, prevState: NoteDetailState) {
    const { note } = this.props
    if (prevState.prevNoteId !== note._id) {
      if (this.queued) {
        const { title, content } = prevState
        this.saveNote(prevState.prevStorageId, prevState.prevNoteId, {
          title,
          content,
        })
      }
    }
  }

  componentWillUnmount() {
    if (this.queued) {
      const { title, content, prevStorageId, prevNoteId } = this.state
      this.saveNote(prevStorageId, prevNoteId, {
        title,
        content,
      })
    }
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
      const { title, content } = this.state
      await this.saveNote(storage.id, note._id, {
        title,
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
      const { title, content } = this.state

      this.saveNote(storage.id, note._id, {
        title,
        content,
      })
    }, 3000)
  }

  async saveNote(
    storageId: string,
    noteId: string,
    { title, content }: { title: string; content: string }
  ) {
    clearTimeout(this.timer)
    this.queued = false

    const { updateNote } = this.props
    await updateNote(storageId, noteId, {
      title,
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

  render() {
    const { note, storage, viewMode } = this.props

    const codeEditor = (
      <CustomizedCodeEditor
        className='editor'
        key={note._id}
        codeMirrorRef={this.codeMirrorRef}
        value={this.state.content}
        onChange={this.updateContent}
        onPaste={this.handlePaste}
        onDrop={this.handleDrop}
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
      <StyledNoteDetailContainer>
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
      </StyledNoteDetailContainer>
    )
  }
}

export default NoteDetail
