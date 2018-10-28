import Client, { ClientErrorTypes } from '../../../lib/db/Client'
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
  describe('getParentPath', () => {
    it('returns the parent path', async () => {
      const client = await createClient()
      expect(client.getParentFolderPath('/test')).toEqual('/')
      expect(client.getParentFolderPath('/test/test')).toEqual('/test')
    })

    it('throws when the given path is root path', async () => {
      const client = await createClient()
      expect.assertions(1)

      try {
        client.getParentFolderPath('/')
      } catch (error) {
        expect(error).toMatchObject({
          name: ClientErrorTypes.UnprocessableEntityError
        })
      }
    })
  })

  describe('validateFolderPath', () => {
    it('returns true if the given path is valid', async () => {
      // Given
      const client = await createClient(false)
      const input = '/test'

      // When
      const result = client.validateFolderPath(input)

      // Then
      expect(result).toBe(true)
    })

    it('returns false if the given path is empty string', async () => {
      // Given
      const client = await createClient(false)
      const input = ''

      // When
      const result = client.validateFolderPath(input)

      // Then
      expect(result).toBe(false)
    })

    it('returns false if the given path does not start with `/`', async () => {
      // Given
      const client = await createClient(false)
      const input = 'test/'

      // When
      const result = client.validateFolderPath(input)

      // Then
      expect(result).toBe(false)
    })

    it('returns false if there are any elements include any reserved characters', async () => {
      // Given
      const client = await createClient(false)
      const input = '/test\\test/'

      // When
      const result = client.validateFolderPath(input)

      // Then
      expect(result).toBe(false)
    })

    it('returns false if there are any elements has zero length', async () => {
      // Given
      const client = await createClient(false)
      const input = '/test//test'

      // When
      const result = client.validateFolderPath(input)

      // Then
      expect(result).toBe(false)
    })
  })

  describe('assertFolderPath', () => {
    it('throws if the folder path is not valid', async () => {
      // Given
      const client = await createClient(false)
      const input = ''
      expect.assertions(1)

      // When
      try {
        client.assertFolderPath(input)
      } catch (error) {
        // Then
        expect(error).toMatchObject({
          name: ClientErrorTypes.UnprocessableEntityError
        })
      }
    })
  })

  describe('#createRootFolderIfNotExist', () => {
    it('creates a root directory if it does not exist', async () => {
      // Given
      const client = await createClient(false)

      // When
      await client.createRootFolderIfNotExist()

      // Then
      const db = client.getDb()
      const rootFolder = await db.get(client.prependFolderIdPrefix('/'))
      expect(rootFolder).toBeDefined()
    })

    it('does not do anything if there is already a root direcotry', async () => {
      // Given
      const client = await createClient()

      // When
      await client.createRootFolderIfNotExist()

      // Then
      const db = client.getDb()
      const rootFolder = await db.get(client.prependFolderIdPrefix('/'))
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
      const createdFolder = await client.getFolder('/hello')
      expect(createdFolder).toMatchObject({
        path: '/hello'
      })
    })

    it('creates a sub folder', async () => {
      // Given
      const client = await createClient()
      await client.createFolder('/hello')

      // When
      const subFolder = await client.createFolder('/hello/world')

      // Then
      expect(subFolder).toMatchObject({
        path: '/hello/world'
      })
      const createdFolder = await client.getFolder('/hello/world')
      expect(createdFolder).toMatchObject({
        path: '/hello/world'
      })
    })

    it('creates a folder with props', async () => {
      // Given
      const client = await createClient()

      // When
      const folder = await client.createFolder('/hello', {
        color: 'red'
      })

      // Then
      expect(folder).toMatchObject({
        path: '/hello',
        color: 'red'
      })
      const createdFolder = await client.getFolder('/hello')
      expect(createdFolder).toMatchObject({
        path: '/hello',
        color: 'red'
      })
    })

    it('throws if the given path is not valid', async () => {
      // Given
      const client = await createClient()
      expect.assertions(1)

      // When
      try {
        await client.createFolder('')
      } catch (error) {
        // Then
        expect(error).toMatchObject({
          name: ClientErrorTypes.UnprocessableEntityError
        })
      }
    })

    it('throws if the parent folder does not exist', async () => {
      // Given
      const client = await createClient()
      expect.assertions(1)

      // When
      try {
        await client.createFolder('/hello/hello')
      } catch (error) {
        // Then
        expect(error).toMatchObject({
          name: ClientErrorTypes.NotFoundError
        })
      }
    })

    it('throws if the parent folder does not exist', async () => {
      // Given
      const client = await createClient()
      expect.assertions(1)

      // When
      try {
        await client.createFolder('/hello/world')
      } catch (error) {
        // Then
        expect(error).toMatchObject({
          name: ClientErrorTypes.NotFoundError
        })
      }
    })
  })

  describe('#getFolder', () => {
    it('gets a folder', async () => {
      // Given
      const client = await createClient()
      await client.createFolder('/hello')

      // When
      const folder = await client.getFolder('/hello')

      // Then
      expect(folder).toMatchObject({
        _id: 'boost:folder:/hello',
        _rev: expect.any(String),
        path: '/hello',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      })
    })

    it('throws when the folder does not exist', async () => {
      // Given
      const client = await createClient()

      // When
      try {
        await client.getFolder('/hello')
      } catch (error) {
        // Then
        expect(error).toMatchObject({
          name: ClientErrorTypes.NotFoundError
        })
      }
    })
  })

  describe('#hasFolder', () => {
    it('returns true if the folder exist', async () => {
      // Given
      const client = await createClient()
      await client.createFolder('/hello')

      // When
      const result = await client.hasFolder('/hello')

      // Then
      expect(result).toBe(true)
    })

    it('returns false if the folder does not exist', async () => {
      // Given
      const client = await createClient()

      // When
      const result = await client.hasFolder('/hello')

      // Then
      expect(result).toBe(false)
    })
  })

  describe('#updateFolder', () => {
    it('updates folder', async () => {
      // Given
      const client = await createClient()
      await client.createFolder('/hello', {
        color: 'red'
      })

      // When
      const updatedFolder = await client.updateFolder('/hello', {
        color: 'blue'
      })

      // Then
      expect(updatedFolder).toEqual(expect.objectContaining({
        path: '/hello',
        color: 'blue'
      }))
      const folder = await client.getFolder('/hello')
      expect(folder).toEqual(expect.objectContaining({
        path: '/hello',
        color: 'blue'
      }))
    })

    it('throws when the folder does not exist', async () => {
      // Given
      const client = await createClient()
      expect.assertions(1)

      // When
      try {
        await client.updateFolder('/hello', {
          color: 'blue'
        })
      } catch (error) {
        // Then
        expect(error).toEqual(expect.objectContaining({
          name: ClientErrorTypes.NotFoundError
        }))
      }
    })
  })

  describe('#moveFolder', () => {
    it('moves a folder', () => {

    })

    it('moves its notes', () => {

    })

    it('moves its sub folders', () => {

    })

    it('throws if the path is invalid', () => {

    })

    it('throws if the next path is invalid', () => {

    })

    it('throws if the path and the next path is same', () => {

    })

    it('throws if the next path is a child path of the current path', () => {

    })
  })

  describe('#removeFolder', () => {
    it('deletes a folder', async () => {
      // Given
      const client = await createClient()
      await client.createFolder('/hello')

      // When
      await client.removeFolder('/hello')

      // Then
      expect(await client.hasFolder('/hello')).toBe(false)
    })

    it('deletes its sub folders', async () => {
      // Given
      const client = await createClient()
      await client.createFolder('/hello')
      await client.createFolder('/hello/kimmy')

      // When
      await client.removeFolder('/hello')

      // Then
      expect(await client.hasFolder('/hello/kimmy')).toBe(false)
    })

    it('deletes all notes in the folder', async () => {

    })

    it('throws if the folder does not exist', () => {

    })

    it('throws if the folder has any sub folders', () => {

    })

    it('throws if the folder has any notes', () => {

    })
  })

  describe('#removeAllSubFolders', () => {
    it('removes all sub folders', async () => {
      // Given
      const client = await createClient()
      await client.createFolder('/hello')
      await client.createFolder('/hello/kimmy')

      // When
      await client.removeSubFolders('/hello')

      // Then
      expect(await client.hasFolder('/hello/kimmy')).toBe(false)
    })

    it('throws if the folder does not exist', async () => {
      // Given
      const client = await createClient()
      await client.createFolder('/hello')
      await client.createFolder('/hello/kimmy')

      // When
      await client.removeSubFolders('/hello')

      // Then
      expect(await client.hasFolder('/hello/kimmy')).toBe(false)
    })
  })

  describe('#createNote', () => {
    it('creates a note', async () => {
      // Given
      const client = await createClient()
      await client.createFolder('/hello')

      // When
      const createdNote = await client.createNote('/hello', {
        content: 'hello'
      })

      // Given
      expect(createdNote).toEqual({
        _id: expect.any(String),
        _rev: expect.any(String),
        folder: '/hello',
        title: '',
        tags: [],
        content: 'hello',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      })
    })

    it('throws if the folder does not exist', async () => {
      // Given
      const client = await createClient()
      expect.assertions(1)

      // When
      try {
        await client.createNote('/hello', {
          content: 'hello'
        })
      } catch (error) {
        expect(error).toEqual(expect.objectContaining({
          name: ClientErrorTypes.NotFoundError
        }))
      }
    })
  })

  describe('#getNote', () => {
    it('returns a note', async () => {
      // Given
      const client = await createClient()
      const note = await client.createNote('/', {
        content: 'hello'
      })

      // When
      const fetchedNote = await client.getNote(note._id)

      // Then
      expect(fetchedNote).toEqual({
        _id: note._id,
        _rev: note._rev,
        folder: '/',
        title: '',
        tags: [],
        content: 'hello',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      })
    })

    it('throws if the note does not exist', async () => {
      // Given
      const client = await createClient()
      expect.assertions(1)

      // When
      try {
        await client.getNote('wrong id')
      } catch (error) {
        // Then
        expect(error).toMatchObject({
          name: ClientErrorTypes.NotFoundError
        })
      }
    })
  })

  describe('#updateNote', () => {
    it('updates a note', async () => {
      // Given
      const client = await createClient()
      const note = await client.createNote('/', {
        content: 'hello'
      })

      // When
      const updatedNote = await client.updateNote(note._id, {
        content: 'hello, kimmy'
      })

      // Then
      expect(updatedNote).toEqual({
        _id: note._id,
        _rev: expect.any(String),
        folder: '/',
        title: '',
        tags: [],
        content: 'hello, kimmy',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      })
    })

    it('throw if the note does not exist', async () => {
      // Given
      const client = await createClient()
      expect.assertions(1)

      // When
      try {
        await client.updateNote('wrong id', {
          content: 'yolo'
        })
      } catch (error) {
        // Then
        expect(error).toMatchObject({
          name: ClientErrorTypes.NotFoundError
        })
      }
    })
  })

  describe('#moveNote', () => {
    it('moves a note', async () => {
      // Given
      const client = await createClient()
      await client.createFolder('/hello')
      await client.createFolder('/world')
      const note = await client.createNote('/hello', {
        content: 'hello'
      })

      // When
      const movedNote = await client.moveNote(note._id, '/world')

      // Given
      expect(movedNote).toEqual({
        _id: expect.any(String),
        _rev: expect.any(String),
        folder: '/world',
        title: '',
        tags: [],
        content: 'hello',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      })
    })

    it('throws if the note does not exist', async () => {
      // Given
      const client = await createClient()
      await client.createFolder('/hello')
      await client.createFolder('/world')

      // When
      try {
        await client.moveNote('wrong id', '/world')
      } catch (error) {
        // Given
        expect(error).toMatchObject({
          name: ClientErrorTypes.NotFoundError,
          message: 'The note does not exist.'
        })
      }
    })

    it('throws if the destination folder does not exist', async () => {
      // Given
      const client = await createClient()
      await client.createFolder('/hello')
      const note = await client.createNote('/hello', {
        content: 'hello'
      })

      // When
      try {
        await client.moveNote(note._id, '/world')
      } catch (error) {
        // Given
        expect(error).toMatchObject({
          name: ClientErrorTypes.NotFoundError,
          message: 'The folder does not exist.'
        })
      }
    })
  })

  describe('#removeNote', () => {
    it('removes a note', async () => {

    })

    it('throws if the note does not exist', () => {

    })
  })

  describe('#removeAllNoteInFolder', () => {
    it('removes all note', () => {

    })
  })
})
