import { observable, action } from 'mobx'
import { Note, Folder } from '../lib/db/dataTypes'
import { FOLDER_ID_PREFIX } from '../../lib/consts'

export default class Storage {
  @observable folderMap: Map<string, Folder> = new Map()
  @observable noteMap: Map<string, Note> = new Map()

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
      this.noteMap.set(note._id, note)
    })
  }

  @action
  removeNote(id: string) {
    this.noteMap.delete(id)
  }
}
