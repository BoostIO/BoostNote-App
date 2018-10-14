import Client from '../../../lib/db/Client'
import {
  getFolderId
} from '../../../lib/db/helpers'
import PouchDBCore from 'pouchdb-core'
import PouchDBMemoryAdapter from 'pouchdb-adapter-memory'

const PouchDB = PouchDBCore
  .plugin(PouchDBMemoryAdapter)

let clientCount = 0
async function createClient (shouldInit: boolean = true): Promise<Client> {
  const db = new PouchDB(`dummy${++clientCount}`, {
    adapter: 'memory'
  })
  const client = new Client(db)

  if (shouldInit) {
    await client.init()
  }

  return client
}

describe('Client', () => {
  describe('#createRootFolderIfNotExist', () => {
    it('creates a root directory if it does not exist', async () => {
      // Given
      const client = await createClient(false)

      // When
      await client.createRootFolderIfNotExist()

      // Then
      const db = client.getDb()
      const rootFolder = await db.get(getFolderId('/'))
      expect(rootFolder).toBeDefined()
    })

    it('does not do anything if there is already a root direcotry', async () => {
      // Given
      const client = await createClient()

      // When
      await client.createRootFolderIfNotExist()

      // Then
      const db = client.getDb()
      const rootFolder = await db.get(getFolderId('/'))
      expect(rootFolder).toBeDefined()
    })
  })

  describe('#init', () => {
    // TODO: add more test cases
    it('creates a root directory', async () => {
      // Given
      const client = await createClient(false)

      // When
      await client.init()

      // Then
      const rootFolder = client.getFolder('/')
      expect(rootFolder).not.toBeNull()
    })
  })

  describe('#createFolder', () => {
    it('creates a folder', async () => {
      // Given
      const client = await createClient()

      // When
      const folder = await client.createFolder('/hello')

      // Then
      expect(folder).toMatchObject({
        path: '/hello'
      })
      const updatedFolder = await client.getFolder('/hello')
      expect(updatedFolder).toMatchObject({
        path: '/hello'
      })
    })

    it('creates a sub folder', async () => {
    })

    it('throws if the parent folder does not exist', async () => {
      // Given
      const client = await createClient()
      await client.createFolder('/hello')
      expect.assertions(1)

      // When
      try {
        await client.createFolder('/hello')
      } catch (error) {
        // Then
        expect(error).toMatchObject({
          name: 'conflict'
        })
      }
    })

    it('throws if the parent folder does not exist', () => {
      // Given

    })
  })

  describe('#getFolder', () => {
    it('gets a folder', async () => {

    })

    it('throws when the folder does not exist', async () => {

    })
  })

  describe('#updateFolder', () => {
    it('updates folder', async () => {

    })

    it('throws when the folder does not exist', async () => {

    })
  })

  describe('#moveFolder', () => {
    it('moves a folder', () => {

    })

    it('moves its notes', () => {

    })
  })

  describe('#removeFolder', () => {
    it('deletes a folder', () => {

    })

    it('deletes its sub folders', () => {

    })

    it('deletes all notes in the folder', () => {

    })

    it('throws if the folder does not exist', () => {

    })

    it('throws if the folder has any sub folders', () => {

    })

    it('throws if the folder has any notes', () => {

    })
  })

  describe('#removeAllSubFolders', () => {
    it('removes all sub folders', () => {

    })
  })

  describe('#createNote', () => {

  })

  describe('#getNote', () => {

  })

  describe('#updateNote', () => {

  })

  describe('#moveNote', () => {
    it('moves a note', () => {

    })

    it('throws if the note does not exist', () => {

    })

    it('throws if the destination folder does not exist', () => {

    })
  })

  describe('#removeNote', () => {
    it('removes a note', () => {

    })

    it('throws if the note does not exist', () => {

    })
  })

  describe('#removeAllNoteInFolder', () => {
    it('removes all note', () => {

    })
  })
})
