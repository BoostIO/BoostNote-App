import Client from '../../../lib/db/Client'
import PouchDB from '../../../lib/db/PouchDB'

describe('Client', () => {
  let client: Client

  beforeEach(async () => {
    client = new Client('db', {
      adapter: 'memory'
    })
    await client.init()
  })

  afterEach(async (done) => {
    await client.destroyDB()
    done()
  })

  describe('#init', () => {
    it('creates a root directory', async () => {
      const client = new Client('init', {
        adapter: 'memory'
      })

      await client.init()

      const rootFolder = client.getFolder('/')
      expect(rootFolder).not.toBeNull()
    })

    it('creates missing folders', async () => {
      const folder = await client.putFolder('/test')
      await client.putNote('test', {
        folder: '/test'
      })
      const rawClient = new PouchDB('db', { adapter: 'memory' })
      await rawClient.remove(folder)
      const newClient = new Client('db', {
        adapter: 'memory'
      })

      await newClient.init()

      const revivedFolder = await newClient.getFolder('/test')
      expect(revivedFolder).toEqual({
        _id: 'folder:/test',
        _rev: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      })
    })
  })

  describe('#putFolder', () => {
    it('creates a folder', async () => {
      const folder = await client.putFolder('/', {
        color: 'red'
      })

      expect(folder).toEqual({
        _id: 'folder:/',
        color: 'red',
        _rev: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      })
    })

    it('update an exsisting folder', async () => {
      await client.putFolder('/', {
        color: 'green'
      })

      const folder = await client.putFolder('/', {
        color: 'red'
      })

      expect(folder).toEqual({
        _id: 'folder:/',
        color: 'red',
        _rev: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      })
    })

    it('creates a sub folder', async () => {
      await client.putFolder('/test')

      const folder = await client.putFolder('/test/test', {
        color: 'red'
      })

      expect(folder).toEqual({
        _id: 'folder:/test/test',
        color: 'red',
        _rev: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      })
    })

    it('throws an error if its parent folder does not exist', async () => {
      await expect(client.putFolder('/test/test', {
        color: 'red'
      })).rejects.toThrowError()
    })
  })

  describe('#getFolder', () => {
    it('gets a folder', async () => {
      await client.putFolder('/', {
        color: 'red'
      })

      const folder = await client.getFolder('/')

      expect(folder).toEqual({
        _id: 'folder:/',
        color: 'red',
        _rev: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      })
    })

    it('returns null if the folder does not exist', async () => {
      const folder = await client.getFolder('/test')

      expect(folder).toEqual(null)
    })
  })

  describe('#removeFolder', () => {
    it('removes a folder', async () => {
      await client.putFolder('/')

      await client.removeFolder('/')

      const folder = await client.getFolder('/')
      expect(folder).toEqual(null)
    })

    it('removes all notes in the folder', async () => {
      await client.putFolder('/')
      await client.putNote('tango', {
        folder: '/'
      })

      await client.removeFolder('/')

      const note = await client.getNote('tango')
      expect(note).toEqual(null)
    })

    it('removes all sub folders', async () => {
      await client.putFolder('/test')
      await client.putFolder('/test/tango')

      await client.removeFolder('/test')

      const folder = await client.getFolder('/test/tango')
      expect(folder).toEqual(null)
    })

    it('does not remove other folder', async () => {
      await client.putFolder('/test')
      await client.putFolder('/test2')

      await client.removeFolder('/test')

      const folder = await client.getFolder('/test2')
      expect(folder).toEqual({
        _id: 'folder:/test2',
        _rev: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      })
    })
  })

  describe('#putNote', () => {
    it('creates a note', async () => {
      await client.putFolder('/test')

      const note = await client.putNote('test', {
        title: 'tango',
        content: 'tangotango',
        folder: '/test',
        tags: ['tango']
      })

      expect(note).toEqual({
        title: 'tango',
        content: 'tangotango',
        tags: ['tango'],
        folder: '/test',
        _id: 'note:test',
        _rev: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      })
      const storedNote = await client.getNote('test')
      expect(storedNote).toEqual({
        title: 'tango',
        content: 'tangotango',
        tags: ['tango'],
        folder: '/test',
        _id: 'note:test',
        _rev: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      })
    })

    it('updates a note', async () => {
      await client.putFolder('/test')

      await client.putNote('test', {
        title: 'tango',
        content: 'tangotango',
        folder: '/test',
        tags: ['tango']
      })

      const note = await client.putNote('test', {
        title: 'changed title',
        content: 'changed content',
        folder: '/test',
        tags: ['tango', 'foxtrot']
      })

      expect(note).toEqual({
        title: 'changed title',
        content: 'changed content',
        folder: '/test',
        tags: ['tango', 'foxtrot'],
        _id: 'note:test',
        _rev: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      })
      const storedNote = await client.getNote('test')
      expect(storedNote).toEqual({
        title: 'changed title',
        content: 'changed content',
        folder: '/test',
        tags: ['tango', 'foxtrot'],
        _id: 'note:test',
        _rev: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      })
    })

    it('throws when the target folder does not exist', async () => {
      await expect(client.putNote('test', {
        title: 'tango',
        content: 'tangotango',
        folder: '/test',
        tags: ['tango']
      })).rejects.toThrowError()
    })
  })

  describe('#getNote', () => {
    it('gets a note', async () => {
      await client.putNote('test', {
        title: 'tango',
        content: 'tangotango',
        folder: '/',
        tags: ['tango']
      })

      const note = await client.getNote('test')

      expect(note).toEqual({
        title: 'tango',
        content: 'tangotango',
        folder: '/',
        tags: ['tango'],
        _id: 'note:test',
        _rev: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      })
    })

    it('returns null when the note does not exist', async () => {
      const note = await client.getNote('test')

      expect(note).toEqual(null)
    })
  })

  describe('#removeNote', () => {
    it('removes a note', async () => {
      await client.putNote('test', {
        title: 'tango',
        content: 'tangotango',
        folder: '/',
        tags: ['tango']
      })

      await client.removeNote('test')

      const note = await client.getNote('test')
      expect(note).toEqual(null)
    })
  })
})
