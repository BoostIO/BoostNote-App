import { Map } from 'immutable'
import { getDB } from './context'
import {
  FOLDER_ID_PREFIX
} from './consts'

export default function upsertFolder (storageName, folderName) {
  const db = getDB(storageName)
  return db
    .get(FOLDER_ID_PREFIX + folderName)
    .catch((err) => {
      if (err.name === 'not_found') return {}
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
