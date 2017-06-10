import loadAllStorages from 'main/lib/dataAPI/loadAllStorages'

describe('dataAPI.loadAllStorages', () => {
  beforeAll(() => {
    window.localStorage.setItem('storages', JSON.stringify([{name: 'Test Storage'}]))
  })

  it('load all storages', () => {
    return loadAllStorages()
      .then(storageMap => {
        const storages = ['Notebook', 'Test Storage']
        storages.forEach(storageName => {
          expect(storageMap.hasIn([storageName])).toBeTruthy()
          expect(storageMap.hasIn([storageName, 'noteMap'])).toBeTruthy()
          expect(storageMap.hasIn([storageName, 'folderMap'])).toBeTruthy()
          expect(storageMap.hasIn([storageName, 'folderMap', 'Notes'])).toBeTruthy()
          expect(storageMap.hasIn([storageName, 'tagMap'])).toBeTruthy()
        })
      })
  })
})
