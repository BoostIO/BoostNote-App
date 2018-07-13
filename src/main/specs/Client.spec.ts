import Client from '../lib/db/Client'

describe('Client', () => {
  let client: Client

  beforeEach(() => {
    client = new Client('db', {
      adapter: 'memory'
    })
  })

  afterEach(async (done) => {
    await client.destroyDB()
    done()
  })

  describe('#putFolder', () => {
    it('creates a folder', async () => {
      const folder = await client.putFolder('/', {
        color: 'red'
      })

      expect(folder).toEqual({
        _id: 'folder:/',
        color: 'red',
        _rev: expect.any(String)
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
        _rev: expect.any(String)
      })
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
        _rev: expect.any(String)
      })
    })

    it('returns null if the folder does not exist', async () => {
      const folder = await client.getFolder('/')

      expect(folder).toEqual(null)
    })
  })

  describe('#removeFolder', () => {
    it('removes a folder', async () => {
      await client.putFolder('/')

      await client.removeFolder('/')
    })
  })
})
