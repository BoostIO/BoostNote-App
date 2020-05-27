import React from 'react'
import { includes } from 'ramda'
import {
  NoteDoc,
  NoteDocEditibleProps,
  Attachment,
  NoteStorage,
} from '../../lib/db/types'
import { isTagNameValid } from '../../lib/db/utils'
import styled from '../../lib/styled'
import CustomizedCodeEditor from '../atoms/CustomizedCodeEditor'
import CustomizedMarkdownPreviewer from '../atoms/CustomizedMarkdownPreviewer'
import {
  textColor,
  borderBottom,
  borderRight,
  uiTextColor,
  PrimaryTextColor,
  backgroundColor,
} from '../../lib/styled/styleFunctions'
import { getFileList } from '../../lib/dnd'
import { ViewModeType, FeatureType } from '../../lib/generalStatus'
import {
  listenNoteDetailFocusTitleInputEvent,
  unlistenNoteDetailFocusTitleInputEvent,
} from '../../lib/events'
import NoteDetailToolbar from '../molecules/NoteDetailToolbar'

const StyledNoteDetailContainer = styled.div`
  ${backgroundColor};
  display: flex;
  flex-direction: column;
  height: 100%;
  .breadCrumbs {
    -webkit-app-region: drag;
    display: block;
    width: 100%;
    height: 25px;
    font-size: 14px;
    padding: 5px 10px;
    overflow: hidden;

    .wrapper {
      display: block;
      position: relative;
      white-space: nowrap;
      padding-bottom: 16px;
      overflow-x: scroll;
      width: 100%;
    }

    .separator {
      ${uiTextColor}
      display: inline-block;
    }

    .folderLink {
      display: inline-block;
      padding: 0 9px;
      cursor: pointer;
      ${uiTextColor}

      &:first-of-type {
        padding-left: 0;
      }

      &.active,
      &:hover {
        ${PrimaryTextColor}
      }
    }
  }
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

  .buttonsWrapper {
    button + button {
      margin-left: 8px;
    }
  }

  .tagsWrapper {
    padding: 5px 0;
    display: flex;
    flex: 1 1 auto;
    min-width: 20px;
    input {
      min-width: 0 !important;
      width: 100%;
    }
  }
`

type NoteDetailProps = {
  currentPathnameWithoutNoteId: string
  note: NoteDoc
  storage: NoteStorage
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
  viewMode: ViewModeType
  selectViewMode: (mode: ViewModeType) => void
  addAttachments(storageId: string, files: File[]): Promise<Attachment[]>
  push: (path: string) => void
  checkFeature: (featureName: FeatureType) => void
}

type NoteDetailState = {
  prevStorageId: string
  prevNoteId: string
  title: string
  content: string
  tags: string[]
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
    const { note, storage } = props
    if (storage.id !== state.prevStorageId || note._id !== state.prevNoteId) {
      return {
        prevStorageId: storage.id,
        prevNoteId: note._id,
        title: note.title,
        content: note.content,
        tags: note.tags,
      }
    }
    return state
  }

  componentDidUpdate(_prevProps: NoteDetailProps, prevState: NoteDetailState) {
    const { note } = this.props
    if (prevState.prevNoteId !== note._id) {
      if (this.queued) {
        const { title, content, tags } = prevState
        this.saveNote(prevState.prevStorageId, prevState.prevNoteId, {
          title,
          content,
          tags,
        })
      }
    }
    listenNoteDetailFocusTitleInputEvent(this.focusTitleInput)
  }

  componentWillUnmount() {
    if (this.queued) {
      const { title, content, tags, prevStorageId, prevNoteId } = this.state
      this.saveNote(prevStorageId, prevNoteId, {
        title,
        content,
        tags,
      })
    }
    unlistenNoteDetailFocusTitleInputEvent(this.focusTitleInput)
  }

  focusTitleInput = () => {
    this.titleInputRef.current!.focus()
  }

  updateTitle = () => {
    this.setState(
      {
        title: this.titleInputRef.current!.value,
      },
      () => {
        this.queueToSave()
      }
    )
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

  appendTagByName = (tagName: string) => {
    const trimmedTagName = tagName.trim()
    if (includes(trimmedTagName, this.state.tags)) {
      return
    }
    if (!isTagNameValid(trimmedTagName)) {
      return
    }
    this.setState(
      (prevState) => ({
        tags: [...new Set([...prevState.tags, trimmedTagName])],
      }),
      () => {
        this.queueToSave()
      }
    )
  }

  removeTagByName = (tagName: string) => {
    this.setState(
      (prevState) => ({
        tags: prevState.tags.filter((aTagName) => aTagName !== tagName),
      }),
      () => {
        this.queueToSave()
      }
    )
  }

  executeSaveQueue = async () => {
    const { note, storage } = this.props

    if (this.queued) {
      const { title, content, tags } = this.state
      await this.saveNote(storage.id, note._id, {
        title,
        content,
        tags,
      })
    }
  }

  trashNote = async () => {
    const { note, storage } = this.props

    await this.executeSaveQueue()
    await this.props.trashNote(storage.id, note._id)
  }

  untrashNote = async () => {
    const { note, storage } = this.props

    await this.executeSaveQueue()
    await this.props.untrashNote(storage.id, note._id)
  }

  purgeNote = async () => {
    const { note, storage } = this.props

    await this.executeSaveQueue()
    this.props.purgeNote(storage.id, note._id)
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
      const { title, content, tags } = this.state

      this.saveNote(storage.id, note._id, {
        title,
        content,
        tags,
      })
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
      tags,
    })
  }

  refreshCodeEditor = () => {
    if (this.codeMirror != null) {
      this.codeMirror.refresh()
    }
  }

  handleDrop = async (event: React.DragEvent) => {
    event.preventDefault()

    const { storage, addAttachments } = this.props

    const files = getFileList(event).filter((file) =>
      file.type.startsWith('image/')
    )

    const attachments = await addAttachments(storage.id, files)

    this.setState(
      (prevState) => {
        return {
          content:
            prevState.content +
            `\n` +
            attachments
              .map((attachment) => `![](${attachment.name})`)
              .join('\n') +
            `\n`,
        }
      },
      () => {
        this.queueToSave()
      }
    )
  }

  navigateToFolder = (folderPathname: string) => () => {
    const { storage } = this.props
    this.props.push(`/app/storages/${storage.id}/notes${folderPathname}`)
  }

  render() {
    const { note, storage, viewMode, selectViewMode } = this.props

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
        attachmentMap={storage.attachmentMap}
        updateContent={this.updateContent}
      />
    )

    return (
      <StyledNoteDetailContainer
        onDragEnd={(event: React.DragEvent) => {
          event.preventDefault()
        }}
        onDrop={this.handleDrop}
      >
        <NoteDetailToolbar
          storage={storage}
          note={note}
          tags={this.state.tags}
          viewMode={viewMode}
          selectViewMode={selectViewMode}
          trashNote={this.trashNote}
          untrashNote={this.untrashNote}
          purgeNote={this.purgeNote}
          appendTagByName={this.appendTagByName}
          removeTagByName={this.removeTagByName}
        />
        <div className='titleSection'>
          <input
            ref={this.titleInputRef}
            value={this.state.title}
            onChange={this.updateTitle}
            placeholder='Title'
          />
        </div>
        <div className='contentSection'>
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
        </div>
      </StyledNoteDetailContainer>
    )
  }
}
