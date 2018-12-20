import React from 'react'
import { inject, observer } from 'mobx-react'
import pathToRegexp from 'path-to-regexp'
import NoteList from './NoteList'
import NoteDetail from './NoteDetail'
import { DataStore, RouteStore } from '../../stores'
import { withRouter, RouteComponentProps } from 'react-router-dom'

type NotePageProps = {
  data?: DataStore
  route?: RouteStore
} & RouteComponentProps

type NotePageState = {}

const storageRegexp = pathToRegexp('/storages/:storageName/:rest*', undefined, {
  sensitive: true
})

@inject('data', 'route')
@observer
class NotePage extends React.Component<NotePageProps, NotePageState> {
  getCurrentStorage() {
    const { data } = this.props
    const storageName = this.getCurrentStorageName()
    return data!.storageMap.get(storageName)
  }

  getCurrentStorageName() {
    const { route } = this.props
    const { pathname } = route!
    const result = storageRegexp.exec(pathname)
    if (result == null) return ''
    const [, storageName] = result
    return storageName
  }

  getCurrentNoteId() {
    const { route } = this.props
    return route!.hash.slice(1)
  }

  getNotes() {
    const storage = this.getCurrentStorage()
    if (storage == null) return []
    return [...storage.noteMap.values()]
  }

  createNote = async () => {
    const { data, history } = this.props
    const storageName = this.getCurrentStorageName()

    const createdNote = await data!.createNote(storageName, '/', {
      content: ''
    })

    history.push(`#${createdNote._id}`)
  }

  updateNote = async (
    storageName: string,
    noteId: string,
    { content }: { content: string }
  ) => {
    const { data } = this.props
    await data!.updateNote(storageName, noteId, {
      content
    })
  }

  removeNote = async (storageName: string, noteId: string) => {
    const { data } = this.props
    await data!.removeNote(storageName, noteId)
  }

  getNote() {
    const { route } = this.props
    const { hash } = route!
    const storage = this.getCurrentStorage()
    if (storage == null) return null
    const id = hash.slice(1)
    return storage.noteMap.get(id)
  }

  render() {
    const storageName = this.getCurrentStorageName()
    const notes = this.getNotes()
    const note = this.getNote()
    const currentNoteId = this.getCurrentNoteId()
    return (
      <>
        <NoteList
          notes={notes}
          currentNoteId={currentNoteId}
          createNote={this.createNote}
        />
        {note == null ? (
          <div>No note selected</div>
        ) : (
          <NoteDetail
            storageName={storageName}
            note={note}
            updateNote={this.updateNote}
            removeNote={this.removeNote}
          />
        )}
      </>
    )
  }
}

export default withRouter(NotePage)
