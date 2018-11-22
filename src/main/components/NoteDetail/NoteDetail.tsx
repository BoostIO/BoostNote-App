import React from 'react'
import { inject, observer } from 'mobx-react'
import DataStore from '../../stores/DataStore'
import RouteStore from '../../stores/RouteStore'
import pathToRegexp from 'path-to-regexp'

type NoteDetailProps = {
  data?: DataStore
  route?: RouteStore
}

type NoteDetailState = {
  prevNoteId: string
  content: string
}

const storageRegexp = pathToRegexp('/storages/:storageName/:rest*', undefined, {
  sensitive: true
})

@inject('data', 'route')
@observer
export default class NoteDetail extends React.Component<
  NoteDetailProps,
  NoteDetailState
> {
  state = {
    prevNoteId: '',
    content: ''
  }
  contentTextareaRef = React.createRef<HTMLTextAreaElement>()

  // TODO: Duplicated
  getCurrentStorageName() {
    const { route } = this.props
    const { pathname } = route!
    const result = storageRegexp.exec(pathname)
    if (result == null) return ''
    const [, storageName] = result
    return storageName
  }

  // TODO: Duplicated
  getCurrentStorage() {
    const { data } = this.props
    const storageName = this.getCurrentStorageName()
    return data!.storageMap.get(storageName)
  }

  getNote() {
    const { route } = this.props
    const { hash } = route!
    const storage = this.getCurrentStorage()
    if (storage == null) return null
    const id = hash.slice(1)
    return storage.noteMap.get(id)
  }

  static getDerivedStateFromProps(
    props: NoteDetailProps,
    state: NoteDetailState
  ): NoteDetailState {
    const { route, data } = props
    const { hash } = route!
    const noteId = hash.slice(1)
    if (noteId !== state.prevNoteId) {
      const { pathname } = route!
      const result = storageRegexp.exec(pathname)
      if (result == null)
        return {
          prevNoteId: noteId,
          content: ''
        }
      const [, storageName] = result
      const storage = data!.storageMap.get(storageName)
      if (storage == null)
        return {
          prevNoteId: noteId,
          content: ''
        }
      const note = storage.noteMap.get(noteId)
      if (note == null)
        return {
          prevNoteId: noteId,
          content: ''
        }

      return {
        prevNoteId: noteId,
        content: note.content
      }
    }
    return state
  }

  componentDidUpdate(prevProps: NoteDetailProps, prevState: NoteDetailState) {
    const { route } = this.props
    const { hash } = route!
    const noteId = hash.slice(1)
    if (noteId !== prevState.prevNoteId && this.queued) {
      const { content } = prevState
      const storageName = this.getCurrentStorageName()
      this.saveNote(storageName, prevState.prevNoteId, { content })
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
      const { content } = this.state
      const { route } = this.props
      const { hash } = route!
      const noteId = hash.slice(1)
      const storageName = this.getCurrentStorageName()
      this.saveNote(storageName, noteId, { content })
    }, 3000)
    console.log('queued')
  }

  async saveNote(
    storageName: string,
    noteId: string,
    { content }: { content: string }
  ) {
    clearTimeout(this.timer)
    this.queued = false

    const { data } = this.props
    await data!.updateNote(storageName, noteId, {
      content
    })
    console.log('saved')
  }

  render() {
    const note = this.getNote()
    return (
      <div>
        <div>Note Detail</div>
        {note == null ? (
          <p>No note is selected</p>
        ) : (
          <>
            <div>{note._id}</div>
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
