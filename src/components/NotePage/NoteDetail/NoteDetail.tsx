import React from 'react'
import { inject, observer } from 'mobx-react'
import { Note } from '../../../types'

type NoteDetailProps = {
  storageId: string
  note: Note
  updateNote: (
    storageId: string,
    noteId: string,
    { content }: { content: string }
  ) => Promise<void>
  removeNote: (storageId: string, noteId: string) => Promise<void>
}

type NoteDetailState = {
  prevStorageId: string
  prevNoteId: string
  content: string
}

@inject('data', 'route')
@observer
export default class NoteDetail extends React.Component<
  NoteDetailProps,
  NoteDetailState
> {
  state = {
    prevStorageId: '',
    prevNoteId: '',
    content: ''
  }
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
        content: note.content
      }
    }
    return state
  }

  componentDidUpdate(_prevProps: NoteDetailProps, prevState: NoteDetailState) {
    const { note } = this.props
    if (note._id !== prevState.prevNoteId && this.queued) {
      const { content } = prevState
      this.saveNote(prevState.prevStorageId, prevState.prevNoteId, {
        content
      })
    }
  }

  componentWillUnmount() {
    if (this.queued) {
      const { content, prevStorageId, prevNoteId } = this.state
      this.saveNote(prevStorageId, prevNoteId, {
        content
      })
    }
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
  timer: number

  queueToSave = () => {
    this.queued = true
    if (this.timer != null) {
      clearTimeout(this.timer)
    }
    this.timer = setTimeout(() => {
      const { storageId, note } = this.props
      const { content } = this.state
      const {} = this.state
      this.saveNote(storageId, note._id, { content })
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
      content
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
        <div>Note Detail</div>
        {note == null ? (
          <p>No note is selected</p>
        ) : (
          <>
            <div>
              {note._id} <button onClick={this.removeNote}>Delete</button>
            </div>
            <div>
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
