import loadStorage from './loadStorage'
import localStorage from 'lib/localStorage'
import { OrderedMap } from 'immutable'
import _ from 'lodash'

const defaultStorageName = 'Notebook'
const defaultStorages = [{name: defaultStorageName}]

/**
 * Read localStorage to get storage list
 * This function is used by #list only
 *
 * @returns {Array} Array of storage data
 */
function readLocalStorage () {
  let storages
  try {
    storages = JSON.parse(localStorage.getItem('storages'))

    // Check if it is an array.
    if (!_.isArray(storages)) {
      throw new Error('Storages must be an array')
    }

    // Check if the default storage exsits.
    if (!storages.some(storage => storage.name === defaultStorageName)) {
      storages.push({
        name: defaultStorageName
      })
      localStorage.setItem('storages', JSON.stringify(storages))
    }

    return storages
  } catch (e) {
    console.warn('Reset storages because of :', e)

    // If the data is corrupted, reset it.
    storages = defaultStorages.slice()
    localStorage.setItem('storages', JSON.stringify(storages))

    return storages
  }
}

/**
 * load all storages
 *
 * @return {Promise<OrderedMap>} StorageMap
 */
export default function loadAllStorages () {
  let storages = readLocalStorage()

  const promises = storages
    .map(storage => {
      const name = storage.name
      return loadStorage(name)
        // struct tuple
        .then(dataMap => [name, dataMap])
    })

  return Promise.all(promises)
    // convert to an OrderedMap
    .then(storageMap => new OrderedMap(storageMap))
}
