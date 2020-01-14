import React from 'react'
import { includes } from 'ramda'
import {
  NoteDoc,
  NoteDocEditibleProps,
  Attachment,
  PopulatedNoteDoc
} from '../../../lib/db/types'
import { isTagNameValid } from '../../../lib/db/utils'
import TagList from './TagList'
import styled from '../../../lib/styled'
import CustomizedCodeEditor from '../../atoms/CustomizedCodeEditor'
import CustomizedMarkdownPreviewer from '../../atoms/CustomizedMarkdownPreviewer'
import ToolbarIconButton from '../../atoms/ToolbarIconButton'
import Toolbar from '../../atoms/Toolbar'
import ToolbarSeparator from '../../atoms/ToolbarSeparator'
import {
  secondaryBackgroundColor,
  textColor,
  borderBottom,
  borderRight,
  uiTextColor,
  PrimaryTextColor
} from '../../../lib/styled/styleFunctions'
import ToolbarExportButton from '../../atoms/ToolbarExportButton'
import { getFileList } from '../../../lib/dnd'
import { ViewModeType } from '../../../lib/generalStatus'
import { BreadCrumbs } from '../NotePage'
import cc from 'classcat'
import {
  IconTrash,
  IconArrowAgain,
  IconPreview,
  IconSplitView,
  IconEditView
} from '../../icons'
import {
  listenNoteDetailFocusTitleInputEvent,
  unlistenNoteDetailFocusTitleInputEvent
} from '../../../lib/events'

export const StyledNoteDetailContainer = styled.div`
  ${secondaryBackgroundColor}
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
  noteStorageName: string
  currentPathnameWithoutNoteId: string
  note: PopulatedNoteDoc
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
  toggleViewMode: (mode: ViewModeType) => void
  addAttachments(storageId: string, files: File[]): Promise<Attachment[]>
  push: (path: string) => void
  breadCrumbs?: BreadCrumbs
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
    const { note } = props
    const { storageId } = note
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
    if (prevState.prevNoteId !== note._id) {
      if (this.queued) {
        const { title, content, tags } = prevState
        this.saveNote(prevState.prevStorageId, prevState.prevNoteId, {
          title,
          content,
          tags
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
        tags
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
    if (includes(this.state.newTagName, this.state.tags)) {
      return
    }
    if (!isTagNameValid(this.state.newTagName)) {
      return
    }
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
    const { note } = this.props
    const { storageId } = note
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
    const { note } = this.props
    const { storageId } = note
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
    const { note } = this.props
    const { storageId } = note
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
      const { note } = this.props
      const { storageId } = note
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

    const { note, addAttachments } = this.props
    const { storageId } = note

    const files = getFileList(event).filter(file =>
      file.type.startsWith('image/')
    )

    const attachments = await addAttachments(storageId, files)

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

  handleBreadCrumbsClick = (folderPathname: string) => () => {
    const { storageId } = this.props.note
    this.props.push(`/app/storages/${storageId}/notes${folderPathname}`)
  }

  render() {
    const {
      note,
      viewMode,
      toggleViewMode,
      noteStorageName,
      currentPathnameWithoutNoteId
    } = this.props
    const { storageId } = note
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
            <div className='breadCrumbs'>
              <div className='wrapper'>
                <div
                  onClick={this.handleBreadCrumbsClick('/')}
                  className={cc([
                    'folderLink',
                    'allNotesLink',
                    currentPathnameWithoutNoteId ===
                      `/app/storages/${note.storageId}/notes` && 'active'
                  ])}
                >
                  {noteStorageName}
                </div>
                {this.props.breadCrumbs != null && (
                  <>
                    <div className='separator'>&frasl;</div>
                    {this.props.breadCrumbs
                      .map(breadCrumb => (
                        <div
                          onClick={this.handleBreadCrumbsClick(
                            breadCrumb.folderPathname
                          )}
                          className={cc([
                            'folderLink',
                            breadCrumb.folderIsActive && 'active'
                          ])}
                          key={breadCrumb.folderLabel}
                        >
                          {breadCrumb.folderLabel}
                        </div>
                      ))
                      .reduce((prev, curr) => (
                        <>
                          {prev}
                          <div className='separator'>&frasl;</div>
                          {curr}
                        </>
                      ))}
                  </>
                )}
              </div>
            </div>
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
            <Toolbar>
              <div className='tagsWrapper'>
                <TagList
                  tags={this.state.tags}
                  removeTagByName={this.removeTagByName}
                />
                <input
                  className='tagInput'
                  ref={this.newTagNameInputRef}
                  value={this.state.newTagName}
                  placeholder='Tags'
                  onChange={this.updateNewTagName}
                  onKeyDown={this.handleNewTagNameInputKeyDown}
                />
                <ToolbarSeparator />
              </div>
              <div className='buttonsWrapper'>
                <ToolbarIconButton
                  className={viewMode === 'edit' ? 'active' : ''}
                  onClick={() => toggleViewMode('edit')}
                  icon={<IconEditView />}
                />
                <ToolbarIconButton
                  className={viewMode === 'split' ? 'active' : ''}
                  onClick={() => toggleViewMode('split')}
                  icon={<IconSplitView />}
                />
                <ToolbarIconButton
                  className={viewMode === 'preview' ? 'active' : ''}
                  onClick={() => toggleViewMode('preview')}
                  icon={<IconPreview />}
                />
                {note.trashed ? (
                  <>
                    <ToolbarIconButton
                      onClick={this.untrashNote}
                      icon={<IconArrowAgain />}
                    />
                    <ToolbarIconButton
                      onClick={this.purgeNote}
                      icon={<IconTrash />}
                    />
                  </>
                ) : (
                  <ToolbarIconButton
                    onClick={this.trashNote}
                    icon={<IconTrash />}
                  />
                )}
                <ToolbarExportButton note={this.props.note} />
              </div>
            </Toolbar>
          </>
        )}
      </StyledNoteDetailContainer>
    )
  }
}
