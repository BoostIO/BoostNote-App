import {
  FOLDER_ID_PREFIX,
  NOTE_ID_PREFIX
} from 'main/lib/dataAPI/consts'
import PouchDB from 'lib/PouchDB'
import markdown from 'lib/markdown'

class DummyDB {
  constructor (db) {
    if (typeof db === 'string') {
      this.db = new PouchDB(db, {adapter: 'memory'})
    } else {
      this.db = db
    }
  }

  createFolder (folderName, overrides) {
    return this.db
      .get(FOLDER_ID_PREFIX + folderName)
      .catch((err) => {
        if (err.name === 'not_found') return {}
        throw err
      })
      .then(doc => {
        return this.db.put(Object.assign({}, doc, overrides, {
          _id: FOLDER_ID_PREFIX + folderName
        }))
      })
  }

  createNote (noteId, overrides) {
    overrides = Object.assign({
      meta: {},
      content: 'Empty',
      folder: 'Notes',
      tags: [],
      updatedAt: new Date().toJSON(),
      createdAt: new Date().toJSON()
    }, overrides)

    const parsed = markdown.parse(overrides.content)
    overrides.meta = Object.assign({
      title: parsed.data.title,
      preview: parsed.data.preview
    }, overrides.meta)

    return this.db
      .get(NOTE_ID_PREFIX + noteId)
      .catch((err) => {
        if (err.name === 'not_found') return {}
        throw err
      })
      .then(doc => {
        return this.db.put(Object.assign({}, doc, overrides, {
          _id: NOTE_ID_PREFIX + noteId
        }))
      })
  }

  get (...args) {
    return this.db.get(...args)
  }

  destroy (...args) {
    return this.db.destroy(...args)
  }
}

export default DummyDB
