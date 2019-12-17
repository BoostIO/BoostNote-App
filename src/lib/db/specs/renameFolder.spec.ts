import { createDbStoreCreator } from '../store'
import { MemoryLiteStorage } from 'ltstrg'
import { renderHook, act } from '@testing-library/react-hooks'
import { NoteStorage, NoteDoc } from '../types'
import { RouterProvider } from '../../router'
import { getFolderId } from '../utils'
import NoteDb from '../NoteDb'
import PouchDB from '../PouchDB'

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

let noteDbCount = 0
async function prepareNoteDb(shouldInit = true): Promise<NoteDb> {
  const id = `dummy${++noteDbCount}`
  const pouchDb = new PouchDB(id, {
    adapter: 'memory'
  })
  const noteDb = new NoteDb(pouchDb, id, id)

  if (shouldInit) {
    await noteDb.init()
  }

  return noteDb
}

describe('NoteDb', () => {
  describe('#renameFolder', () => {
    it('renames the folder', async () => {
      // Given
      const noteDb = await prepareNoteDb()
      await noteDb.init()
      await noteDb.createNote({
        title: 'test title1',
        content: 'test content1',
        folderPathname: '/test'
      })

      // When
      await noteDb.renameFolder('/test', '/testok')

      // Then
      const storedNewFolder = await noteDb.getFolder('/testok')
      expect(storedNewFolder).toMatchObject({
        _id: getFolderId('/testok'),
        createdAt: storedNewFolder!.createdAt
      })
    })
    it('moves the notes', async () => {
      // Given
      const noteDb = await prepareNoteDb()
      await noteDb.init()
      const note = await noteDb.createNote({
        title: 'test title1',
        content: 'test content1',
        folderPathname: '/test'
      })

      // When
      await noteDb.renameFolder('/test', '/testok')

      // Then
      const storedNote = await noteDb.getNote(note._id)
      expect(storedNote).toMatchObject({
        folderPathname: '/testok'
      })
    })

    it('throws an error if folder already exists', async () => {
      // Given
      const noteDb = await prepareNoteDb()
      await noteDb.init()
      await noteDb.createNote({
        title: 'test title1',
        content: 'test content1',
        folderPathname: '/test'
      })

      await noteDb.createNote({
        title: 'test title2',
        content: 'test content2',
        folderPathname: '/testok'
      })

      // When
      const promise = noteDb.renameFolder('/test', '/testok')

      // Then
      expect(promise).rejects.toThrow(`this folder already exists \`/testok\``)
    })

    it('throws an error if folder depth is different', async () => {
      // Given
      const noteDb = await prepareNoteDb()
      await noteDb.init()
      await noteDb.createNote({
        title: 'test title1',
        content: 'test content1',
        folderPathname: '/test'
      })

      await noteDb.createNote({
        title: 'test title2',
        content: 'test content2',
        folderPathname: '/testok'
      })

      // When
      const promise = noteDb.renameFolder('/test', '/test/testok')

      // Then
      expect(promise).rejects.toThrow(`New name is invalid. \`/test/testok\``)
    })
  })
})

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
