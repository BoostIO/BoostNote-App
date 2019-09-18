import React from 'react'
import { NoteDoc, NoteDocEditibleProps } from '../../../lib/db/types'

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
    tags: []
  }
  titleInputRef = React.createRef<HTMLInputElement>()
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
        tags: note.tags
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
      <div>
        {note == null ? (
          <p>No note is selected</p>
        ) : (
          <>
            <div>
              {note._id} <button onClick={this.removeNote}>Delete</button>
            </div>
            <div>
              <div>
                <input
                  value={this.state.title}
                  onChange={this.updateTitle}
                  ref={this.titleInputRef}
                />
              </div>
              <div>
                {this.state.tags.map(tag => (
                  <div key={tag}>{tag}</div>
                ))}
                <input />
              </div>
              <textarea
                ref={this.contentTextareaRef}
                value={this.state.content}
                onChange={this.updateContent}
              />
            </div>
          </>
        )}
      </div>
    )
  }
}
