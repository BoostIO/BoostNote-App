import { createDbStoreCreator, getStorageDataList } from './store'
import { MemoryLiteStorage } from 'ltstrg'
import { renderHook, act } from '@testing-library/react-hooks'
import { NoteStorage, NoteDoc } from './types'
import { getFolderId } from './utils'
import { RouterProvider } from '../router'

function prepareDbStore() {
  const memoryStorage = new MemoryLiteStorage()
  const { result } = renderHook(
    () => createDbStoreCreator(memoryStorage, 'memory')(),
    {
      wrapper: RouterProvider
    }
  )

  return {
    result,
    memoryStorage
  }
}

describe('DbStore', () => {
  describe('#createStorage', () => {
    it('creates a storage', async () => {
      // Given
      const { result, memoryStorage } = prepareDbStore()

      let storage: NoteStorage
      await act(async () => {
        await result.current.initialize()

        // When
        storage = await result.current.createStorage('test')
      })

      // Then
      expect(result.current.storageMap).toEqual({
        [storage!.id]: expect.objectContaining({
          name: 'test'
        })
      })

      expect(getStorageDataList(memoryStorage)).toEqual([
        {
          id: storage!.id,
          name: 'test'
        }
      ])
    })
  })

  describe('#removeStorage', () => {
    it('remove a storage', async () => {
      // Given
      const { result, memoryStorage } = prepareDbStore()

      let storage: NoteStorage
      await act(async () => {
        await result.current.initialize()
        storage = await result.current.createStorage('test')

        // When
        await result.current.removeStorage(storage.id)
      })

      // Then
      expect(result.current.storageMap).toEqual({})

      expect(getStorageDataList(memoryStorage)).toEqual([])
    })
  })

  describe('#renameStorage', () => {
    it('renames a storage', async () => {
      // Given
      const { result, memoryStorage } = prepareDbStore()

      let storage: NoteStorage
      await act(async () => {
        await result.current.initialize()
        storage = await result.current.createStorage('test')

        // When
        await result.current.renameStorage(storage.id, 'changed')
      })

      // Then
      expect(result.current.storageMap).toEqual({
        [storage!.id]: expect.objectContaining({
          name: 'changed'
        })
      })

      expect(getStorageDataList(memoryStorage)).toEqual([
        {
          id: storage!.id,
          name: 'changed'
        }
      ])
    })
  })

  describe('#createFolder', () => {
    it('creates a folder', async () => {
      // Given
      const { result } = prepareDbStore()
      let storage: NoteStorage
      await act(async () => {
        await result.current.initialize()
        storage = await result.current.createStorage('test')

        // When
        await result.current.createFolder(storage.id, '/test')
      })

      // Then
      expect(result.current.storageMap[storage!.id]!.folderMap).toEqual({
        '/': expect.objectContaining({ pathname: '/' }),
        '/test': expect.objectContaining({ pathname: '/test' })
      })

      const folderDoc = await storage!.db.getFolder('/test')
      expect(folderDoc).toMatchObject({
        _id: getFolderId('/test')
      })
    })

    it('refreshes folderMap to reflect(collateral parent folder creation)', async () => {
      // Given
      const { result } = prepareDbStore()
      let storage: NoteStorage
      await act(async () => {
        await result.current.initialize()
        storage = await result.current.createStorage('test')

        // When
        await result.current.createFolder(storage.id, '/test/child folder')
      })

      // Then
      expect(result.current.storageMap[storage!.id]!.folderMap).toEqual({
        '/': expect.objectContaining({ pathname: '/' }),
        '/test': expect.objectContaining({ pathname: '/test' }),
        '/test/child folder': expect.objectContaining({
          pathname: '/test/child folder'
        })
      })

      const folderDoc = await storage!.db.getFolder('/test')
      expect(folderDoc).toMatchObject({
        _id: getFolderId('/test')
      })

      const chioldFolderDoc = await storage!.db.getFolder('/test/child folder')
      expect(chioldFolderDoc).toMatchObject({
        _id: getFolderId('/test/child folder')
      })
    })
  })

  describe('#removeFolder', () => {
    it('removes a folder and its notes', async () => {
      // Given
      const { result } = prepareDbStore()
      let storage: NoteStorage
      await act(async () => {
        await result.current.initialize()
        storage = await result.current.createStorage('test')
        await result.current.createFolder(storage.id, '/test')

        // When
        await result.current.removeFolder(storage.id, '/test')
      })

      // Then
      expect(result.current.storageMap[storage!.id]!.folderMap).toEqual({
        '/': expect.objectContaining({ pathname: '/' })
      })
      // TODO: check note deletion too.
    })

    it('removes its child folders', async () => {
      // Given
      const { result } = prepareDbStore()
      let storage: NoteStorage
      await act(async () => {
        await result.current.initialize()
        storage = await result.current.createStorage('test')
        await result.current.createFolder(storage.id, '/test/child folder')

        // When
        await result.current.removeFolder(storage.id, '/test')
      })

      // Then
      expect(result.current.storageMap[storage!.id]!.folderMap).toEqual({
        '/': expect.objectContaining({ pathname: '/' })
      })
    })

    // TODO: routing test when current folder or current folder's parent folder is deleted.
  })

  describe('#createNote', () => {
    it('creates a note and registers in the map', async () => {
      // given
      const { result } = prepareDbStore()
      let storage: NoteStorage
      let noteDoc: NoteDoc | undefined
      await act(async () => {
        await result.current.initialize()
        storage = await result.current.createStorage('test')
        await result.current.createFolder(storage.id, '/test')

        // When
        noteDoc = await result.current.createNote(storage.id, {
          title: 'testNote'
        })
      })
      // Then
      expect(result.current.storageMap[storage!.id]!.noteMap).toEqual({
        [noteDoc!._id]: expect.objectContaining({ title: 'testNote' })
      })
    })

    it('creates a note and register its tag', async () => {
      // given
      const { result } = prepareDbStore()
      let storage: NoteStorage
      let noteDoc: NoteDoc | undefined
      await act(async () => {
        await result.current.initialize()
        storage = await result.current.createStorage('test')
        await result.current.createFolder(storage.id, '/test')

        // When
        noteDoc = await result.current.createNote(storage.id, {
          title: 'testNote',
          tags: ['testTag']
        })
      })
      // Then
      expect(
        result.current.storageMap[storage!.id]!.tagMap[noteDoc!.tags[0]]!
          .noteIdSet
      ).toMatchObject(new Set([noteDoc!._id]))
    })
  })

  describe('#updateNote', () => {
    it('update a Note and handle tag removal', async () => {
      // given
      const { result } = prepareDbStore()
      let storage: NoteStorage
      let noteDoc: NoteDoc | undefined
      await act(async () => {
        await result.current.initialize()
        storage = await result.current.createStorage('test')
        await result.current.createFolder(storage.id, '/test')
        noteDoc = await result.current.createNote(storage.id, {
          title: 'testNote',
          tags: ['tag1', 'tag2']
        })

        // When
        noteDoc = await result.current.updateNote(storage.id, noteDoc!._id, {
          tags: ['tag2']
        })
      })
      // Then
      expect(
        result.current.storageMap[storage!.id]!.tagMap['tag1']!.noteIdSet.size
      ).toEqual(0)
    })
    it('update a Note and handle tag addition', async () => {
      // given
      const { result } = prepareDbStore()
      let storage: NoteStorage
      let noteDoc: NoteDoc | undefined
      await act(async () => {
        await result.current.initialize()
        storage = await result.current.createStorage('test')
        await result.current.createFolder(storage.id, '/test')
        noteDoc = await result.current.createNote(storage.id, {
          title: 'testNote',
          tags: ['tag1']
        })
        await result.current.createNote(storage.id, {
          title: 'testNote',
          tags: ['tag2']
        })

        // When
        noteDoc = await result.current.updateNote(storage.id, noteDoc!._id, {
          tags: ['tag1', 'tag2']
        })
      })
      // Then
      expect(
        result.current.storageMap[storage!.id]!.tagMap['tag2']!.noteIdSet.size
      ).toEqual(2)
    })
  })
})
