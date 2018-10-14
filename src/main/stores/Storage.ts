import { observable, action } from 'mobx'
import { Note, Folder } from '../lib/db/dataTypes'

export default class Storage {
  @observable folderMap: Map<string, Folder> = new Map()
  @observable noteMap: Map<string, Note> = new Map()

  @action addFolder (...folders: Folder[]) {
    folders.forEach(folder => {
      this.folderMap.set(folder._id, folder)
    })
  }

  @action removeFolder (id: string) {
    this.folderMap.delete(id)
  }

  @action addNote (...notes: Note[]) {
    notes.forEach(note => {
      this.noteMap.set(note._id, note)
    })
  }

  @action removeNote (id: string) {
    this.noteMap.delete(id)
  }
}
