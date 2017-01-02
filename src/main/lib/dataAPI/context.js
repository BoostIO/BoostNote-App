import PouchDB from 'lib/PouchDB'

const dbMap = new Map()

function constructDB (name) {
  return process.env.NODE_ENV !== 'test'
    ? new PouchDB(name, {adapter: 'websql'})
    : new PouchDB(name, {adapter: 'memory'})
}

export function getDB (name) {
  let db = dbMap.get(name)
  if (db == null) {
    db = constructDB(name)
    dbMap.set(name, db)
  }

  return db
}

const context = {
  getDB,
  dbMap
}

export default context
