import { createDbStoreCreator } from '../store'
import { MemoryLiteStorage } from 'ltstrg'
import { renderHook, act } from '@testing-library/react-hooks'
import { NoteStorage, NoteDoc } from '../types'
import { RouterProvider } from '../../router'
import { getFolderId } from '../utils'
import { combineProviders } from '../../utils/context'
import { ToastProvider } from '../../toast'

function prepareDbStore() {
  const memoryStorage = new MemoryLiteStorage()
  const { result } = renderHook(
    () => createDbStoreCreator(memoryStorage, 'memory')(),
    {
      wrapper: combineProviders(RouterProvider, ToastProvider)
    }
  )

  return {
    result,
    memoryStorage
  }
}

describe('Dbstore', () => {
  describe('#renameFolder', () => {
    it('removes a folder previous path', async () => {
      // Given
      const { result } = prepareDbStore()
      let storage: NoteStorage
      await act(async () => {
        await result.current.initialize()
        storage = await result.current.createStorage('test')
        await result.current.createFolder(storage.id, '/test')

        // When
        await result.current.renameFolder(storage.id, '/test', '/testok')
      })

      // Then
      expect(
        result.current.storageMap[storage!.id]!.folderMap['/test']
      ).toBeUndefined()

      const folderDoc = await storage!.db.getFolder('/test')
      expect(folderDoc).toBeNull()
    })

    it('creates a folder with the new path', async () => {
      // Given
      const { result } = prepareDbStore()
      let storage: NoteStorage
      await act(async () => {
        await result.current.initialize()
        storage = await result.current.createStorage('test')
        await result.current.createFolder(storage.id, '/test')

        // When
        await result.current.renameFolder(storage.id, '/test', '/testok')
      })

      // Then
      const folderDoc = await storage!.db.getFolder('/testok')
      expect(folderDoc).toMatchObject({
        _id: getFolderId('/testok')
      })

      expect(
        result.current.storageMap[storage!.id]!.folderMap['/testok']
      ).toBeDefined()
    })

    it('removes subfolders with the previous path', async () => {
      // Given
      const { result } = prepareDbStore()
      let storage: NoteStorage
      await act(async () => {
        await result.current.initialize()
        storage = await result.current.createStorage('test')
        await result.current.createFolder(storage.id, '/test/subtest')

        // When
        await result.current.renameFolder(storage.id, '/test', '/testok')
      })

      // Then
      expect(
        result.current.storageMap[storage!.id]!.folderMap['/test/subtest']
      ).toBeUndefined()

      const folderDoc = await storage!.db.getFolder('/test/subtest')
      expect(folderDoc).toBeNull()
    })

    it('creates subfolders with the new path', async () => {
      // Given
      const { result } = prepareDbStore()
      let storage: NoteStorage
      await act(async () => {
        await result.current.initialize()
        storage = await result.current.createStorage('test')
        await result.current.createFolder(storage.id, '/test/subtest')

        // When
        await result.current.renameFolder(storage.id, '/test', '/testok')
      })

      // Then
      const folderDoc = await storage!.db.getFolder('/testok/subtest')
      expect(folderDoc).toMatchObject({
        _id: getFolderId('/testok/subtest')
      })

      expect(
        result.current.storageMap[storage!.id]!.folderMap['/testok/subtest']
      ).toBeDefined()
    })

    it("changes the notes' folderpathname", async () => {
      const { result } = prepareDbStore()
      let storage: NoteStorage
      let note: NoteDoc
      await act(async () => {
        await result.current.initialize()
        storage = await result.current.createStorage('test')
        note = (await result.current.createNote(storage.id, {
          folderPathname: '/test'
        })) as NoteDoc

        // When
        await result.current.renameFolder(storage.id, '/test', '/testok')
      })

      // Then
      expect(
        result.current.storageMap[storage!.id]!.noteMap[note!._id]
      ).toMatchObject({
        folderPathname: '/testok'
      })
    })

    it("changes the subfolders' notes' folderpathnames", async () => {
      const { result } = prepareDbStore()
      let storage: NoteStorage
      let note: NoteDoc
      await act(async () => {
        await result.current.initialize()
        storage = await result.current.createStorage('test')
        note = (await result.current.createNote(storage.id, {
          folderPathname: '/test/subfolder'
        })) as NoteDoc

        // When
        await result.current.renameFolder(storage.id, '/test', '/testok')
      })

      // Then
      expect(
        result.current.storageMap[storage!.id]!.noteMap[note!._id]
      ).toMatchObject({
        folderPathname: '/testok/subfolder'
      })
    })

    // take notes and move them
    // take sub folders and move them
    // take sub folders notes and move them

    // erase ALL the previous folders
  })
})
