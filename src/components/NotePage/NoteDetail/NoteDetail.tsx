import React from 'react'
import { NoteDoc, NoteDocEditibleProps } from '../../../lib/db/types'
import { isTagNameValid } from '../../../lib/db/utils'
import TagList from './TagList'
import styled from '../../../lib/styled'
import Icon from '../../atoms/Icon'
import { mdiTrashCan } from '@mdi/js'

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
    margin: 2px;
    position: relative;
    textarea {
      position: absolute;
      top: 0;
      bottom: 0;
      resize: none;
      padding: 4px;
      width: 100%;
      border: none;
      box-sizing: border-box;
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
  removeNote: (storageId: string, noteId: string) => Promise<void>
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
  state = {
    prevStorageId: '',
    prevNoteId: '',
    title: '',
    content: '',
    tags: [],
    newTagName: ''
  }
  titleInputRef = React.createRef<HTMLInputElement>()
  newTagNameInputRef = React.createRef<HTMLInputElement>()
  contentTextareaRef = React.createRef<HTMLTextAreaElement>()

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

  updateContent = () => {
    this.setState(
      {
        content: this.contentTextareaRef.current!.value
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

  removeNote = async () => {
    const { storageId, note, removeNote } = this.props

    await removeNote(storageId, note._id)
  }

  render() {
    const { note } = this.props

    return (
      <StyledNoteDetailContainer>
        {note == null ? (
          <p>No note is selected</p>
        ) : (
          <>
            <div>
              {note._id}{' '}
              <button onClick={this.removeNote}>
                <Icon path={mdiTrashCan} />
              </button>
            </div>
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
              <textarea
                ref={this.contentTextareaRef}
                value={this.state.content}
                onChange={this.updateContent}
              />
            </div>
          </>
        )}
      </StyledNoteDetailContainer>
    )
  }
}
