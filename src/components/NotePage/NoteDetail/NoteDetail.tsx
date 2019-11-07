import React from 'react'
import { NoteDoc, NoteDocEditibleProps } from '../../../lib/db/types'
import { isTagNameValid } from '../../../lib/db/utils'
import TagList from './TagList'
import styled from '../../../lib/styled'
import CustomizedCodeEditor from '../../atoms/CustomizedCodeEditor'
import MarkdownPreviewer from '../../atoms/MarkdownPreviewer'
import NoteDetailToolbar from './NoteDetailToolbar'

const StyledNoteDetailContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  .titleSection {
    display: flex;
    margin-bottom: 2px;
    input {
      margin: 2px;
      font-size: 24px;
      border: none;
      height: 40px;
      padding: 0 4px;
      flex: 1;
    }
  }

  .tagSection {
    display: flex;
    margin-bottom: 2px;

    input {
      border: none;
      margin-left: 2px;
      padding: 0 2px;
    }
  }

  .contentSection {
    flex: 1;
    overflow: hidden;
    margin: 2px;
    position: relative;
    border-top: solid 1px ${({ theme }) => theme.colors.border};
    .CodeMirror {
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
      border-right: solid 1px ${({ theme }) => theme.colors.border};
    }
    .splitRight {
      position: absolute;
      left: 50%;
      width: 50%;
      height: 100%;
    }
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
  removeNote: (storageId: string, noteId: string) => Promise<void>
}

type NoteDetailState = {
  prevStorageId: string
  prevNoteId: string
  title: string
  content: string
  tags: string[]
  newTagName: string
  mode: 'edit' | 'preview' | 'split'
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
    newTagName: '',
    mode: 'edit'
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
        newTagName: '',
        mode: state.mode
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

  queued = false
  timer?: number

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

  selectMode = (mode: 'edit' | 'preview' | 'split') => {
    this.setState({ mode })
  }

  refreshCodeEditor = () => {
    if (this.codeMirror != null) {
      this.codeMirror.refresh()
    }
  }

  render() {
    const { note } = this.props

    const codeEditor = (
      <CustomizedCodeEditor
        key={note._id}
        codeMirrorRef={this.codeMirrorRef}
        value={this.state.content}
        onChange={this.updateContent}
      />
    )
    const markdownPreviewer = <MarkdownPreviewer content={this.state.content} />

    return (
      <StyledNoteDetailContainer>
        {note == null ? (
          <p>No note is selected</p>
        ) : (
          <>
            <NoteDetailToolbar
              mode={this.state.mode}
              note={note}
              selectMode={this.selectMode}
              trashNote={this.trashNote}
            />
            <div className='titleSection'>
              <input
                ref={this.titleInputRef}
                value={this.state.title}
                onChange={this.updateTitle}
              />
            </div>
            <div className='tagSection'>
              <TagList
                tags={this.state.tags}
                removeTagByName={this.removeTagByName}
              />
              <input
                ref={this.newTagNameInputRef}
                value={this.state.newTagName}
                placeholder='New Tag...'
                onChange={this.updateNewTagName}
                onKeyDown={this.handleNewTagNameInputKeyDown}
              />
            </div>
            <div className='contentSection'>
              {this.state.mode === 'edit' ? (
                codeEditor
              ) : this.state.mode === 'split' ? (
                <>
                  <div className='splitLeft'>{codeEditor}</div>
                  <div className='splitRight'>{markdownPreviewer}</div>
                </>
              ) : (
                markdownPreviewer
              )}
            </div>
          </>
        )}
      </StyledNoteDetailContainer>
    )
  }
}
