import { Map } from 'immutable'
import { getDB } from './context'
import {
  TAG_ID_PREFIX
} from './consts'

export default function upsertTag (storageName, tagName) {
  const db = getDB(storageName)
  return db
    .get(TAG_ID_PREFIX + tagName)
    .catch(err => {
      if (err.name === 'not_found') return {}
      throw err
    })
    .then(doc => {
      return db.put(Object.assign({
        _id: TAG_ID_PREFIX + tagName
      }, doc))
    })
    .then(res => {
      return {
        id: tagName,
        tag: new Map({rev: res.rev})
      }
    })
}
