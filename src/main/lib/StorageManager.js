const PouchDB = require('pouchdb')
const { OrderedMap, Map, Set } = require('immutable')
const util = require('lib/util')
const _ = require('lodash')

const defaultStorageName = 'Notebook'
const defaultStorages = [{name: defaultStorageName}]

/**
 * Read localStorage to get storage list
 * This function is used by #list only
 *
 * @returns {Array} Array of storage data
 */
function readLocalStorage () {
  // If on test env, never read localStoarge
  if (process.env.NODE_ENV === 'test') {
    return [{
      name: 'Test Notebook'
    }]
  }

  let storages
  try {
    storages = JSON.parse(window.localStorage.getItem('storages'))

    // Check if it is an array.
    if (!_.isArray(storages)) {
      throw new Error('Storages must be an array')
    }

    // Check if the default storage exsits.
    if (!storages.some(storage => storage.name === defaultStorageName)) {
      storages.push({
        name: defaultStorageName
      })
      window.localStorage.setItem('storages', JSON.stringify(storages))
    }

    return storages
  } catch (e) {
    console.warn('Reset storages because of :', e)

    // If the data is corrupted, reset it.
    storages = defaultStorages.slice()
    window.localStorage.setItem('storages', JSON.stringify(storages))

    return storages
  }
}

function newDB (name) {
  return new PouchDB(name, {adapter: 'websql'})
}

let dbMap = null

export function list () {
  let storages = readLocalStorage()

  dbMap = new OrderedMap(storages.map(storage => {
    return [storage.name, newDB(storage.name)]
  }))
  return dbMap
}

export function getDB (name) {
  if (dbMap == null) list()

  let db = dbMap.get(name)

  if (db == null) {
    db = newDB(name)

    dbMap.set(name, db)

    let storages = readLocalStorage()
    storages.push({
      name
    })
    window.localStorage.setItem('stoarges', JSON.stringify(storages))
  }

  return db
}

const NOTE_ID_PREFIX = 'note:'
const FOLDER_ID_PREFIX = 'folder:'
const isNoteId = new RegExp(`^${NOTE_ID_PREFIX}.+`)
const isFolderId = new RegExp(`^${FOLDER_ID_PREFIX}.+`)

/**
 * load dataMap from a storage
 *
 * @param  {String} name [description]
 * @return {Map} return data map of a Storage
 * including `notes` and `folders` field
 */
export function load (name) {
  return getDB(name)
    .allDocs({include_docs: true})
    .then((data) => {
      let { notes, folders } = data.rows.reduce((sum, row) => {
        if (isNoteId.test(row.id)) {
          let noteId = row.id.substring(NOTE_ID_PREFIX.length)
          sum.notes.push([noteId, new Map({
            folder: row.doc.folder,
            title: row.doc.title,
            content: row.doc.content,
            tags: new Set(row.doc.tags),
            createdAt: row.doc.createdAt,
            updatedAt: row.doc.updatedAt
          })])
        } else if (isFolderId.test(row.id)) {
          let folderPath = row.id.substring(FOLDER_ID_PREFIX.length)
          sum.folders.push([folderPath, new Map({
            notes: new Set()
          })])
        }
        return sum
      }, {
        notes: [],
        folders: []
      })
      let noteMap = new Map(notes)
      let folderMap = new Map(folders)

      noteMap.forEach((note, noteId) => {
        folderMap = folderMap.updateIn(
          [note.get('folder'), 'notes'],
          noteSet => {
            if (noteSet == null) return new Set([noteId])
            return noteSet.add(noteId)
          }
        )
      })

      // Each repository should have `Notes` folder by default.
      if (!folderMap.has('Notes')) {
        folderMap = folderMap.set('Notes', new Map({
          notes: new Set()
        }))
      }

      return new Map([
        ['notes', noteMap],
        ['folders', folderMap]
      ])
    })
}
/**
 * load dataMaps from all storages and map them
 *
 * @return {OrderedMap} Data Map of all storages
 */
export function loadAll () {
  const promises = list()
    .keySeq()
    .map(name => {
      return load(name)
        // struct tuple
        .then(dataMap => [name, dataMap])
    })
    // Promise.all only understands array
    .toArray()

  return Promise.all(promises)
    // convert to an OrderedMap
    .then(storageMap => new OrderedMap(storageMap))
}

export function upsertFolder (name, folderName) {
  const db = getDB(name)
  return db
    .get(FOLDER_ID_PREFIX + folderName)
    .catch((err) => {
      if (err.name === 'not_found') return null
      throw err
    })
    .then(doc => {
      return db.put(Object.assign({
        _id: FOLDER_ID_PREFIX + folderName
      }, doc))
    })
    .then(res => {
      return {
        id: folderName,
        folder: new Map({rev: res.rev})
      }
    })
}

const noteView = {
  _id: '_design/notes',
  views: {
    by_folder: {
      map: `function mapFun(doc) {
        emit(doc.folder);
      }`
    }
  }
}

export function deleteFolder (name, folderName) {
  const db = getDB(name)
  return db
    .get(FOLDER_ID_PREFIX + folderName)
    .then((doc) => {
      doc._deleted = true
      return db.put(doc)
    })
    .then(() => {
      return db.put(noteView)
        .catch(err => {
          if (err.name !== 'conflict') throw err
        })
        .then(() => {
          return db.query('notes/by_folder', {
            key: folderName,
            include_docs: true
          })
        })
        .then(function (result) {
          let docs = result.rows.map(row => {
            row.doc._deleted = true
            return row.doc
          })
          return db.bulkDocs(docs)
        })
    })
    .then((res) => {
      return {
        id: folderName
      }
    })
}

export function createNote (name, payload) {
  const db = getDB(name)

  function genNoteId () {
    let id = util.randomBytes()
    return db.get(NOTE_ID_PREFIX + id)
      .then((doc) => {
        if (doc == null) return id
        return genNoteId()
      })
      .catch((err) => {
        if (err.name === 'not_found') return id
        throw err
      })
  }

  return genNoteId()
    .then((noteId) => {
      return db
        .put(Object.assign({}, payload, {
          _id: NOTE_ID_PREFIX + noteId
        }))
        .then(res => {
          return {
            id: noteId,
            note: new Map({
              title: payload.title,
              content: payload.content,
              tags: new Set(payload.tags),
              folder: payload.folder,
              rev: res.rev
            })
          }
        })
    })
}

export function updateNote (name, noteId, payload) {
  const db = getDB(name)

  return db.get(NOTE_ID_PREFIX + noteId)
    .then((doc) => {
      payload = Object.assign({}, doc,
        _.pick(payload, ['title', 'content', 'tags']),
        {
          _id: doc._id,
          _rev: doc._rev,
          updatedAt: new Date()
        })
      return db
        .put(payload)
        .then(res => {
          return {
            id: noteId,
            note: new Map({
              title: payload.title,
              content: payload.content,
              tags: new Set(payload.tags),
              folder: payload.folder,
              rev: res.rev
            })
          }
        })
    })
}

export function deleteNote (name, noteId) {
  const db = getDB(name)

  return db.get(NOTE_ID_PREFIX + noteId)
    .then((doc) => {
      doc._deleted = true
      return db
        .put(doc)
        .then(res => {
          return {
            id: noteId
          }
        })
    })
}

export default {
  list,
  load,
  loadAll,
  upsertFolder,
  deleteFolder,
  createNote,
  updateNote,
  deleteNote
}
