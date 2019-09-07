import { createDbStoreCreator } from './store'
import { MemoryLiteStorage } from 'ltstrg'
import { renderHook, act } from '@testing-library/react-hooks'
import { NoteStorage } from './types'

describe('DbStore', () => {
  describe('#createStorage', () => {
    it('creates a storage', async () => {
      // Given
      const { result } = renderHook(() =>
        createDbStoreCreator(new MemoryLiteStorage(), 'memory')()
      )

      let storage: NoteStorage | undefined
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
    })
  })

  describe('#removeStorage', () => {
    it('remove a storage', async () => {
      // Given
      const { result } = renderHook(() =>
        createDbStoreCreator(new MemoryLiteStorage(), 'memory')()
      )

      let storage: NoteStorage | undefined
      await act(async () => {
        await result.current.initialize()
        storage = await result.current.createStorage('test')

        // When
        await result.current.removeStorage(storage.id)
      })

      // Then
      expect(result.current.storageMap).toEqual({})
    })
  })
})
