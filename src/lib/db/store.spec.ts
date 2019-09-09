import { createDbStoreCreator, getStorageDataList } from './store'
import { MemoryLiteStorage } from 'ltstrg'
import { renderHook, act } from '@testing-library/react-hooks'
import { NoteStorage } from './types'

describe('DbStore', () => {
  describe('#createStorage', () => {
    it('creates a storage', async () => {
      // Given
      const memoryStorage = new MemoryLiteStorage()
      const { result } = renderHook(() =>
        createDbStoreCreator(memoryStorage, 'memory')()
      )

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
      const memoryStorage = new MemoryLiteStorage()
      const { result } = renderHook(() =>
        createDbStoreCreator(memoryStorage, 'memory')()
      )

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
      const memoryStorage = new MemoryLiteStorage()
      const { result } = renderHook(() =>
        createDbStoreCreator(memoryStorage, 'memory')()
      )

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
})
