import React from 'react'
import { inject, observer } from 'mobx-react'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import pathToRegexp from 'path-to-regexp'
import DataStore from '../../stores/DataStore'
import RouteStore from '../../stores/RouteStore'
import NoteItem from './NoteItem'

type NoteListProps = {
  data?: DataStore
  route?: RouteStore
} & RouteComponentProps

type NoteListState = {}

const storageRegexp = pathToRegexp('/storages/:storageName/:rest*', undefined, {
  sensitive: true
})

@inject('data', 'route')
@observer
class NoteList extends React.Component<NoteListProps, NoteListState> {
  getCurrentStorageName() {
    const { route } = this.props
    const { pathname } = route!
    const result = storageRegexp.exec(pathname)
    if (result == null) return ''
    const [, storageName] = result
    return storageName
  }

  getCurrentStorage() {
    const { data } = this.props
    const storageName = this.getCurrentStorageName()
    return data!.storageMap.get(storageName)
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

  render() {
    const { route } = this.props
    const { hash } = route!
    const notes = this.getNotes()
    return (
      <div>
        <div>Note List</div>
        <ul>
          {notes.map(note => (
            <NoteItem key={note._id} hash={hash} note={note} />
          ))}
        </ul>
        {notes.length === 0 && <p>No notes</p>}
        <div>
          <button onClick={this.createNote}>New note</button>
        </div>
      </div>
    )
  }
}

export default withRouter(NoteList)
