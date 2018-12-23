import { observable, action, ObservableMap } from 'mobx'
import { Note, Folder } from '../types'
import { FOLDER_ID_PREFIX } from '../consts'
import { difference } from 'ramda'

export default class Storage {
  @observable folderMap: Map<string, Folder> = new Map()
  @observable noteMap: Map<string, Note> = new Map()

  /**
   * FIXME: We should use ObservableSet here. But it is not available yet.
   * https://github.com/mobxjs/mobx/pull/1592
   */
  @observable tagNoteIdSetMap: Map<string, Map<string, string>> = new Map()

  @action
  addFolder(...folders: Folder[]) {
    folders.forEach(folder => {
      this.folderMap.set(folder._id, folder)
    })
  }

  @action
  removeFolder(folderPath: string) {
    const folderId = `${FOLDER_ID_PREFIX}${folderPath}`
    const allFolderIds = [...this.folderMap.keys()]
    const deletedFolderKeys = [] as string[]
    allFolderIds.forEach(id => {
      if (folderId === id || id.startsWith(`${folderId}/`)) {
        deletedFolderKeys.push(id)
        this.folderMap.delete(id)
      }
    })

    const noteEntries = [...this.noteMap.entries()]
    noteEntries.forEach(([noteId, note]) => {
      if (
        note.folder === folderPath ||
        note.folder.startsWith(`${folderPath}/`)
      ) {
        this.noteMap.delete(noteId)
      }
    })
  }

  @action
  addNote(...notes: Note[]) {
    notes.forEach(note => {
      const previousNote = this.noteMap.get(note._id)
      const previousTags = previousNote == null ? [] : previousNote.tags

      const tagsToBeDeleted = difference(previousTags, note.tags)
      const tagsToBeAdded = difference(note.tags, previousTags)

      tagsToBeDeleted.forEach(tag => this.unbindNoteIdToTag(tag, note._id))
      tagsToBeAdded.forEach(tag => this.bindNoteIdToTag(tag, note._id))

      this.noteMap.set(note._id, note)
    })
  }

  @action
  removeNote(id: string) {
    this.noteMap.delete(id)
  }

  @action
  unbindNoteIdToTag(tag: string, noteId: string) {
    const noteSet = this.tagNoteIdSetMap.get(tag)!
    noteSet.delete(noteId)
    if (noteSet.size === 0) {
      this.tagNoteIdSetMap.delete(tag)
    }
  }

  @action
  bindNoteIdToTag(tag: string, noteId: string) {
    let noteSet: Map<string, string>
    if (this.tagNoteIdSetMap.has(tag)) {
      noteSet = this.tagNoteIdSetMap.get(tag)!
    } else {
      noteSet = new ObservableMap()
      this.tagNoteIdSetMap.set(tag, noteSet)
    }
    noteSet.set(noteId, noteId)
  }
}
