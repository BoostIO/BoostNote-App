import React from 'react'
import { inject, observer } from 'mobx-react'
import { Note } from '../../../types'

type NoteDetailProps = {
  storageName: string
  note: Note
  updateNote: (
    storageName: string,
    noteId: string,
    { content }: { content: string }
  ) => Promise<void>
  removeNote: (storageName: string, noteId: string) => Promise<void>
}

type NoteDetailState = {
  prevStorageName: string
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
    prevStorageName: '',
    prevNoteId: '',
    content: ''
  }
  contentTextareaRef = React.createRef<HTMLTextAreaElement>()

  static getDerivedStateFromProps(
    props: NoteDetailProps,
    state: NoteDetailState
  ): NoteDetailState {
    const { note, storageName } = props
    if (
      storageName !== state.prevStorageName ||
      note._id !== state.prevNoteId
    ) {
      return {
        prevStorageName: storageName,
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
      this.saveNote(prevState.prevStorageName, prevState.prevNoteId, {
        content
      })
    }
  }

  componentWillUnmount() {
    if (this.queued) {
      const { content, prevStorageName, prevNoteId } = this.state
      this.saveNote(prevStorageName, prevNoteId, {
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
  timer: NodeJS.Timeout

  queueToSave = () => {
    this.queued = true
    if (this.timer != null) {
      clearTimeout(this.timer)
    }
    this.timer = setTimeout(() => {
      const { storageName, note } = this.props
      const { content } = this.state
      const {} = this.state
      this.saveNote(storageName, note._id, { content })
    }, 3000)
  }

  async saveNote(
    storageName: string,
    noteId: string,
    { content }: { content: string }
  ) {
    clearTimeout(this.timer)
    this.queued = false

    const { updateNote } = this.props
    await updateNote(storageName, noteId, {
      content
    })
  }

  removeNote = async () => {
    const { storageName, note, removeNote } = this.props

    await removeNote(storageName, note._id)
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
