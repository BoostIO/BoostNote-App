import React from 'react'
import { inject, observer } from 'mobx-react'
import pathToRegexp from 'path-to-regexp'
import NoteList from './NoteList'
import NoteDetail from './NoteDetail'
import { DataStore, RouteStore } from '../../stores'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { computed } from 'mobx'

type NotePageProps = {
  data?: DataStore
  route?: RouteStore
} & RouteComponentProps

type NotePageState = {}

const storageRegexp = pathToRegexp('/storages/:storageName/:rest*', undefined, {
  sensitive: true
})
const folderRegexp = pathToRegexp(
  '/storages/:storageName/notes/:rest*',
  undefined,
  {
    sensitive: true
  }
)
const tagRegexp = pathToRegexp('/storages/:storageName/tags/:tag', undefined, {
  sensitive: true
})

@inject('data', 'route')
@observer
class NotePage extends React.Component<NotePageProps, NotePageState> {
  @computed
  get currentStorage() {
    const { data } = this.props
    const { currentStorageName } = this
    return data!.storageMap.get(currentStorageName)
  }

  @computed
  get currentStorageName() {
    const { route } = this.props
    const { pathname } = route!
    const result = storageRegexp.exec(pathname)
    if (result == null) return ''
    const [, storageName] = result
    return storageName
  }

  @computed
  get currentNoteId() {
    const { route } = this.props
    return route!.hash.slice(1)
  }

  @computed
  get pathname() {
    return this.props.route!.pathname
  }

  @computed
  get allNotes() {
    const { currentStorage } = this
    if (currentStorage == null) return []
    return [...currentStorage.noteMap.values()]
  }

  @computed
  get filteredNotes() {
    const { pathname, allNotes, currentStorage } = this
    if (currentStorage == null) return []
    const folderRegexpResult = folderRegexp.exec(pathname)
    if (folderRegexpResult != null) {
      const folderPath =
        folderRegexpResult[2] == null ? '/' : `/${folderRegexpResult[2]}`
      return allNotes.filter(note => note.folder === folderPath)
    }
    const tagRegexpResult = tagRegexp.exec(pathname)
    if (tagRegexpResult != null) {
      const tag = tagRegexpResult[2]
      const noteIds = [...currentStorage.tagNoteIdSetMap.get(tag)!.values()]
      return noteIds.map(noteId => currentStorage.noteMap.get(noteId)!)
    }
    return []
  }

  @computed
  get currentNote() {
    const { route } = this.props
    const { hash } = route!
    const { currentStorage } = this
    if (currentStorage == null) return null
    const id = hash.slice(1)
    return currentStorage.noteMap.get(id)
  }

  @computed
  get currentFolderPath() {
    const { route } = this.props
    const { pathname } = route!

    const result = folderRegexp.exec(pathname)
    if (result == null) return '/'

    const [, , rest] = result
    if (rest == null) return '/'
    return `/${rest}`
  }

  createNote = async () => {
    const { data, history } = this.props
    const { currentStorageName, currentFolderPath } = this
    const targetFolderPath = currentFolderPath == null ? '/' : currentFolderPath

    const createdNote = await data!.createNote(
      currentStorageName,
      targetFolderPath,
      {
        content: ['---', 'title: ', 'tags: ', '---', ''].join('\n')
      }
    )

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

  // TODO: Redirect to the next note after deleting selected note
  removeNote = async (storageName: string, noteId: string) => {
    const { data } = this.props
    await data!.removeNote(storageName, noteId)
  }

  render() {
    const {
      currentStorageName,
      filteredNotes,
      currentNote,
      currentNoteId
    } = this
    return (
      <>
        <NoteList
          notes={filteredNotes}
          currentNoteId={currentNoteId}
          createNote={this.createNote}
        />
        {currentNote == null ? (
          <div>No note selected</div>
        ) : (
          <NoteDetail
            storageName={currentStorageName}
            note={currentNote}
            updateNote={this.updateNote}
            removeNote={this.removeNote}
          />
        )}
      </>
    )
  }
}

export default withRouter(NotePage)
