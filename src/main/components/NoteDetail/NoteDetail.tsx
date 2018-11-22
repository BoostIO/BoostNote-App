import React from 'react'
import { inject, observer } from 'mobx-react'
import DataStore from '../../stores/DataStore'
import RouteStore from '../../stores/RouteStore'
import pathToRegexp from 'path-to-regexp'

type NoteDetailProps = {
  data?: DataStore
  route?: RouteStore
}

type NoteDetailState = {}

const storageRegexp = pathToRegexp('/storages/:storageName/:rest*', undefined, {
  sensitive: true
})

@inject('data', 'route')
@observer
export default class NoteDetail extends React.Component<
  NoteDetailProps,
  NoteDetailState
> {
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
              <textarea value={note.content} readOnly={true} />
            </div>
          </>
        )}
      </div>
    )
  }
}
