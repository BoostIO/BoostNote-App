import React from 'react'
import { inject, observer } from 'mobx-react'
import DataStore from '../../stores/DataStore'
import RouteStore from '../../stores/RouteStore'
import pathToRegexp from 'path-to-regexp'
import { Link } from 'react-router-dom'

type NoteListProps = {
  data?: DataStore
  route?: RouteStore
}

type NoteListState = {}

const storageRegexp = pathToRegexp('/storages/:storageName/:rest*', undefined, {
  sensitive: true
})

@inject('data', 'route')
@observer
export default class NoteList extends React.Component<
  NoteListProps,
  NoteListState
> {
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

  createNote = () => {
    const { data } = this.props
    const storageName = this.getCurrentStorageName()

    data!.createNote(storageName, '/', {
      content: ''
    })
  }

  render() {
    const notes = this.getNotes()
    return (
      <div>
        <div>Note List</div>
        <ul>
          {notes.map(note => (
            <li key={note._id}>
              <Link to={`#${note._id}`}>{note._id}</Link>
            </li>
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
