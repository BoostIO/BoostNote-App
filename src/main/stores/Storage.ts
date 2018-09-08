import { observable, action } from 'mobx'
import { FolderDocument, NoteDocument, Note, Folder } from '../lib/db/dataTypes'

export default class Storage {
  @observable folderMap: Map<string, FolderDocument> = new Map()
  @observable noteMap: Map<string, NoteDocument> = new Map()

  @action addFolder (...folders: FolderDocument[]) {
    folders.forEach(folder => {
      this.folderMap.set(folder._id, folder)
    })
  }

  @action removeFolder (id: string) {
    this.folderMap.delete(id)
  }

  @action addNote (...notes: NoteDocument[]) {
    notes.forEach(note => {
      this.noteMap.set(note._id, note)
    })
  }

  @action removeNote (id: string) {
    this.noteMap.delete(id)
  }
}
