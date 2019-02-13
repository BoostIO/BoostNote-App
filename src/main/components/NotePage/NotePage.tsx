import React from 'react'
import { inject, observer } from 'mobx-react'
import NoteList from './NoteList'
import NoteDetail from './NoteDetail'
import { RouteStore } from '../../lib/RouteStore'
import { DataStore } from '../../lib/db/DataStore'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { computed } from 'mobx'
import { storageRegexp, folderRegexp, tagRegexp } from '../../lib/routes'

type NotePageProps = {
  data?: DataStore
  route?: RouteStore
} & RouteComponentProps

type NotePageState = {}

@inject('data', 'route')
@observer
class NotePage extends React.Component<NotePageProps, NotePageState> {
  @computed
  get currentStorage() {
    const { data } = this.props
    const { currentStorageId } = this
    return data!.storageMap.get(currentStorageId)
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
  get currentStorageId() {
    const { data } = this.props
    return data!.getStorageId(this.currentStorageName)
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
    const { currentStorageId, currentFolderPath } = this
    const targetFolderPath = currentFolderPath == null ? '/' : currentFolderPath

    const createdNote = await data!.createNote(
      currentStorageId,
      targetFolderPath,
      {
        content: ['---', 'title: ', 'tags: ', '---', ''].join('\n')
      }
    )

    history.push(`#${createdNote._id}`)
  }

  updateNote = async (
    storageId: string,
    noteId: string,
    { content }: { content: string }
  ) => {
    const { data } = this.props
    await data!.updateNote(storageId, noteId, {
      content
    })
  }

  // TODO: Redirect to the next note after deleting selected note
  removeNote = async (storageId: string, noteId: string) => {
    const { data } = this.props
    await data!.removeNote(storageId, noteId)
  }

  render() {
    const { currentStorageId, filteredNotes, currentNote, currentNoteId } = this
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
            storageId={currentStorageId}
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
