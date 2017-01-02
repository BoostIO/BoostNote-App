import loadAllStorages from 'main/lib/dataAPI/loadAllStorages'
import LocalStorage from 'specs/mock/LocalStorage'

const localStorage = new LocalStorage()
localStorage.setItem('storages', JSON.stringify([{name: 'Test Storage'}]))
loadAllStorages.__Rewire__('localStorage', localStorage)

export default t => {
  return loadAllStorages()
    .then(storageMap => {
      const storages = ['Notebook', 'Test Storage']
      storages.forEach(storageName => {
        t.ok(storageMap.hasIn([storageName]))
        t.ok(storageMap.hasIn([storageName, 'noteMap']))
        t.ok(storageMap.hasIn([storageName, 'folderMap']))
        t.ok(storageMap.hasIn([storageName, 'folderMap', 'Notes']))
        t.ok(storageMap.hasIn([storageName, 'tagMap']))
      })
    })
}
