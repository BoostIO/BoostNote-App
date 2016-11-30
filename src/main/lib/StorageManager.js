const sander = require('sander')
const path = require('path')
const PouchDB = require('pouchdb')
const { OrderedMap, Map, Set } = require('immutable')
const util = require('lib/util')
const _ = require('lodash')

const electron = require('electron')
const { remote } = electron

const storagesPath = process.env.NODE_ENV !== 'test'
  ? path.join(remote.app.getPath('userData'), 'storages')
  : path.join(remote.app.getPath('userData'), 'test-storages')

let dbs

/**
 * Initialize db connection
 * If nothing is found, add a new connection
 *
 * @return {OrderedMap} All DB connections
 */
export function init () {
  let dirNames
  try {
    dirNames = sander.readdirSync(storagesPath)
  } catch (err) {
    // If `storages` doesn't exist, create it.
    if (err.code === 'ENOENT') {
      sander.mkdirSync(storagesPath)
      dirNames = []
    } else throw err
  }
  // If `storages/notebook` doesn't exist, create it.
  if (!dirNames.some((dirName) => dirName === 'notebook')) {
    dirNames.unshift('notebook')
  }

  dbs = dirNames.reduce(function (map, name) {
    return map.set(name, new PouchDB(path.join(storagesPath, name)))
  }, new OrderedMap())

  return dbs
}

init()

export function list () {
  if (dbs == null) return init()
  return Promise.resolve(new OrderedMap(dbs))
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
  const db = dbs.get(name)
  if (db == null) return Promise.reject(new Error('DB doesn\'t exist.'))

  return db
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
  const promises = dbs
    .keySeq()
    .map((name) => {
      return load(name)
        // struct tuple
        .then((dataMap) => [name, dataMap])
    })
    // Promise.all only understands array
    .toArray()

  return Promise.all(promises)
    // destruct tuple
    .then((storageMap) => new OrderedMap(storageMap))
}

export function upsertFolder (name, folderName) {
  const db = dbs.get(name)
  if (db == null) return Promise.reject(new Error('DB doesn\'t exist.'))

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

export function deleteFolder (name, folderName) {
  const db = dbs.get(name)
  if (db == null) return Promise.reject(new Error('DB doesn\'t exist.'))
  return db.get(FOLDER_ID_PREFIX + folderName)
    .then((doc) => {
      doc._deleted = true
      return db.put(doc)
    })
    .then((res) => {
      return {
        id: folderName
      }
    })
}

export function createNote (name, payload) {
  const db = dbs.get(name)
  if (db == null) return Promise.reject(new Error('DB doesn\'t exist.'))

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
  const db = dbs.get(name)
  if (db == null) return Promise.reject(new Error('DB doesn\'t exist.'))

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
  const db = dbs.get(name)
  if (db == null) return Promise.reject(new Error('DB doesn\'t exist.'))

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
  init,
  list,
  load,
  loadAll,
  upsertFolder,
  deleteFolder,
  createNote,
  updateNote,
  deleteNote
}
