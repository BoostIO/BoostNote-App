import React from 'react'
import {
  NoteDoc,
  NoteDocEditibleProps,
  Attachment
} from '../../../lib/db/types'
import { isTagNameValid } from '../../../lib/db/utils'
import TagList from './TagList'
import styled from '../../../lib/styled'
import CustomizedCodeEditor from '../../atoms/CustomizedCodeEditor'
import CustomizedMarkdownPreviewer from '../../atoms/CustomizedMarkdownPreviewer'
import {
  mdiTrashCan,
  mdiEyeOutline,
  mdiArrowSplitVertical,
  mdiFormatText,
  mdiDeleteEmpty,
  mdiRestore
} from '@mdi/js'
import ToolbarIconButton from '../../atoms/ToolbarIconButton'
import Toolbar from '../../atoms/Toolbar'
import ToolbarSeparator from '../../atoms/ToolbarSeparator'
import {
  secondaryBackgroundColor,
  textColor,
  borderBottom,
  borderRight
} from '../../../lib/styled/styleFunctions'
import ToolbarExportButton from '../../atoms/ToolbarExportButton'
import { getFileList } from '../../../lib/dnd'

const StyledNoteDetailContainer = styled.div`
  ${secondaryBackgroundColor}
  display: flex;
  flex-direction: column;
  height: 100%;
  .titleSection {
    display: flex;
    height: 50px;
    border-width: 0 0 1px;
    ${borderBottom}

    input {
      font-size: 24px;
      border: none;
      height: 100%;
      padding: 0 12px;
      flex: 1;
      background-color: transparent;
      ${textColor}
    }
  }

  .contentSection {
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
      padding: 0 10px;
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
  }

  .tagInput {
    background-color: transparent;
    border: none;
    ${textColor}
    margin-left: 4px;
  }
`

type NoteDetailProps = {
  storageId: string
  note: NoteDoc
  updateNote: (
    storageId: string,
    noteId: string,
    props: Partial<NoteDocEditibleProps>
  ) => Promise<void | NoteDoc>
  trashNote: (storageId: string, noteId: string) => Promise<NoteDoc | undefined>
  untrashNote: (
    storageId: string,
    noteId: string
  ) => Promise<NoteDoc | undefined>
  purgeNote: (storageId: string, noteId: string) => void
  splitMode: boolean
  previewMode: boolean
  toggleSplitMode: () => void
  togglePreviewMode: () => void
  addAttachments(storageId: string, files: File[]): Promise<Attachment[]>
}

type NoteDetailState = {
  prevStorageId: string
  prevNoteId: string
  title: string
  content: string
  tags: string[]
  newTagName: string
}

export default class NoteDetail extends React.Component<
  NoteDetailProps,
  NoteDetailState
> {
  state: NoteDetailState = {
    prevStorageId: '',
    prevNoteId: '',
    title: '',
    content: '',
    tags: [],
    newTagName: ''
  }
  titleInputRef = React.createRef<HTMLInputElement>()
  newTagNameInputRef = React.createRef<HTMLInputElement>()
  codeMirror?: CodeMirror.EditorFromTextArea
  codeMirrorRef = (codeMirror: CodeMirror.EditorFromTextArea) => {
    this.codeMirror = codeMirror
  }

  static getDerivedStateFromProps(
    props: NoteDetailProps,
    state: NoteDetailState
  ): NoteDetailState {
    const { note, storageId } = props
    if (storageId !== state.prevStorageId || note._id !== state.prevNoteId) {
      return {
        prevStorageId: storageId,
        prevNoteId: note._id,
        title: note.title,
        content: note.content,
        tags: note.tags,
        newTagName: ''
      }
    }
    return state
  }

  componentDidUpdate(_prevProps: NoteDetailProps, prevState: NoteDetailState) {
    const { note } = this.props
    if (note._id !== prevState.prevNoteId && this.queued) {
      const { title, content, tags } = prevState
      this.saveNote(prevState.prevStorageId, prevState.prevNoteId, {
        title,
        content,
        tags
      })
    }
  }

  componentWillUnmount() {
    if (this.queued) {
      const { title, content, tags, prevStorageId, prevNoteId } = this.state
      this.saveNote(prevStorageId, prevNoteId, {
        title,
        content,
        tags
      })
    }
  }

  updateTitle = () => {
    this.setState(
      {
        title: this.titleInputRef.current!.value
      },
      () => {
        this.queueToSave()
      }
    )
  }

  updateContent = (newValue: string) => {
    this.setState(
      {
        content: newValue
      },
      () => {
        this.queueToSave()
      }
    )
  }

  updateNewTagName = () => {
    this.setState({
      newTagName: this.newTagNameInputRef.current!.value
    })
  }

  handleNewTagNameInputKeyDown: React.KeyboardEventHandler = event => {
    switch (event.key) {
      case 'Enter':
        event.preventDefault()
        this.appendNewTag()
        return
    }
  }

  appendNewTag = () => {
    if (isTagNameValid(this.state.newTagName)) {
      this.setState(
        prevState => ({
          newTagName: '',
          tags: [...prevState.tags, prevState.newTagName]
        }),
        () => {
          this.queueToSave()
        }
      )
    }
  }

  removeTagByName = (tagName: string) => {
    this.setState(
      prevState => ({
        tags: prevState.tags.filter(aTagName => aTagName !== tagName)
      }),
      () => {
        this.queueToSave()
      }
    )
  }

  trashNote = async () => {
    const { storageId, note } = this.props
    const noteId = note._id

    if (this.queued) {
      const { title, content, tags } = this.state
      await this.saveNote(storageId, noteId, {
        title,
        content,
        tags
      })
    }
    await this.props.trashNote(storageId, noteId)
  }

  untrashNote = async () => {
    const { storageId, note } = this.props
    const noteId = note._id

    if (this.queued) {
      const { title, content, tags } = this.state
      await this.saveNote(storageId, noteId, {
        title,
        content,
        tags
      })
    }
    await this.props.untrashNote(storageId, noteId)
  }

  purgeNote = async () => {
    const { storageId, note } = this.props
    const noteId = note._id

    if (this.queued) {
      const { title, content, tags } = this.state
      await this.saveNote(storageId, noteId, {
        title,
        content,
        tags
      })
    }
    await this.props.purgeNote(storageId, noteId)
  }

  queued = false
  timer?: any

  queueToSave = () => {
    this.queued = true
    if (this.timer != null) {
      clearTimeout(this.timer)
    }
    this.timer = setTimeout(() => {
      const { storageId, note } = this.props
      const { title, content, tags } = this.state

      this.saveNote(storageId, note._id, { title, content, tags })
    }, 3000)
  }

  async saveNote(
    storageId: string,
    noteId: string,
    { title, content, tags }: { title: string; content: string; tags: string[] }
  ) {
    clearTimeout(this.timer)
    this.queued = false

    const { updateNote } = this.props
    await updateNote(storageId, noteId, {
      title,
      content,
      tags
    })
  }

  refreshCodeEditor = () => {
    if (this.codeMirror != null) {
      this.codeMirror.refresh()
    }
  }

  handleDrop = async (event: React.DragEvent) => {
    event.preventDefault()

    const { storageId, addAttachments: addAttachment } = this.props

    const files = getFileList(event).filter(file =>
      file.type.startsWith('image/')
    )

    const attachments = await addAttachment(storageId, files)

    this.setState(
      prevState => {
        return {
          content:
            prevState.content +
            `\n` +
            attachments
              .map(attachment => `![](${attachment.name})`)
              .join('\n') +
            `\n`
        }
      },
      () => {
        this.queueToSave()
      }
    )
  }

  render() {
    const {
      note,
      splitMode,
      previewMode,
      toggleSplitMode,
      togglePreviewMode,
      storageId
    } = this.props

    const codeEditor = (
      <CustomizedCodeEditor
        className='editor'
        key={note._id}
        codeMirrorRef={this.codeMirrorRef}
        value={this.state.content}
        onChange={this.updateContent}
      />
    )
    const markdownPreviewer = (
      <CustomizedMarkdownPreviewer
        content={this.state.content}
        storageId={storageId}
      />
    )

    return (
      <StyledNoteDetailContainer
        onDragEnd={(event: React.DragEvent) => {
          event.preventDefault()
        }}
        onDrop={this.handleDrop}
      >
        {note == null ? (
          <p>No note is selected</p>
        ) : (
          <>
            <div className='titleSection'>
              <input
                ref={this.titleInputRef}
                value={this.state.title}
                onChange={this.updateTitle}
              />
            </div>
            <div className='contentSection'>
              {previewMode ? (
                markdownPreviewer
              ) : splitMode ? (
                <>
                  <div className='splitLeft'>{codeEditor}</div>
                  <div className='splitRight'>{markdownPreviewer}</div>
                </>
              ) : (
                codeEditor
              )}
            </div>
            <Toolbar>
              <TagList
                tags={this.state.tags}
                removeTagByName={this.removeTagByName}
              />
              <input
                className='tagInput'
                ref={this.newTagNameInputRef}
                value={this.state.newTagName}
                placeholder='Set Tags for the note...'
                onChange={this.updateNewTagName}
                onKeyDown={this.handleNewTagNameInputKeyDown}
              />
              <ToolbarSeparator />
              <ToolbarExportButton note={this.props.note} />
              <ToolbarIconButton onClick={() => {}} path={mdiFormatText} />
              <ToolbarIconButton
                className={splitMode ? 'active' : ''}
                onClick={toggleSplitMode}
                path={mdiArrowSplitVertical}
              />
              <ToolbarIconButton
                className={previewMode ? 'active' : ''}
                onClick={togglePreviewMode}
                path={mdiEyeOutline}
              />
              {note.trashed ? (
                <>
                  <ToolbarIconButton
                    onClick={this.untrashNote}
                    path={mdiRestore}
                  />
                  <ToolbarIconButton
                    onClick={this.purgeNote}
                    path={mdiDeleteEmpty}
                  />
                </>
              ) : (
                <ToolbarIconButton
                  onClick={this.trashNote}
                  path={mdiTrashCan}
                />
              )}
            </Toolbar>
          </>
        )}
      </StyledNoteDetailContainer>
    )
  }
}
