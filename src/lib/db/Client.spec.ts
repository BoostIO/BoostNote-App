import Client from './Client'
import PouchDB from './PouchDB'
import { getFolderId, getTagId, generateNoteId, getNow } from './utils'
import { NoteData, FolderData, ExceptRev } from './types'

let clientCount = 0
async function createClient(shouldInit: boolean = true): Promise<Client> {
  const id = `dummy${++clientCount}`
  const db = new PouchDB(id, {
    adapter: 'memory'
  })
  const client = new Client(db, id, id)

  if (shouldInit) {
    await client.init()
  }

  return client
}

describe('Client', () => {
  describe('#getFolder', () => {
    it('returns a folder', async () => {
      // Given
      const client = await createClient()
      const now = new Date().toISOString()
      await client.db.put<ExceptRev<FolderData>>({
        _id: getFolderId('/test'),
        createdAt: now,
        updatedAt: now,
        data: {}
      })

      // When
      const result = await client.getFolder('/test')

      // Then
      expect(result).toEqual({
        _id: getFolderId('/test'),
        _rev: expect.any(String),
        createdAt: now,
        updatedAt: now,
        data: {}
      })
    })

    it('returns null if the folder does not exist', async () => {
      // Given
      const client = await createClient()

      // When
      const result = await client.getFolder('/test')

      // Then
      expect(result).toEqual(null)
    })
  })

  describe('#upsertFolder', () => {
    it('creates a folder if it does not exist yet', async () => {
      // Given
      const client = await createClient()

      // When
      const result = await client.upsertFolder('/test')

      // Then
      expect(result).toEqual({
        _id: getFolderId('/test'),
        _rev: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        data: {}
      })

      const doc = await client.db.get(getFolderId('/test'))
      expect(doc).toEqual({
        _id: getFolderId('/test'),
        _rev: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        data: {}
      })
    })

    it('creates parent folder if it does not exist', async () => {
      // Given
      const client = await createClient()

      // When
      const result = await client.upsertFolder('/parent/test')

      // Then
      expect(result).toEqual({
        _id: getFolderId('/parent/test'),
        _rev: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        data: {}
      })

      const doc = await client.db.get(getFolderId('/parent/test'))
      expect(doc).toEqual({
        _id: getFolderId('/parent/test'),
        _rev: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        data: {}
      })

      const parentDoc = await client.db.get(getFolderId('/parent'))
      expect(parentDoc).toEqual({
        _id: getFolderId('/parent'),
        _rev: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        data: {}
      })
    })

    it('updates folder props', async () => {
      // Given
      const client = await createClient()
      await client.upsertFolder('/test')

      // When
      const result = await client.upsertFolder('/test', {
        data: { message: 'yolo' }
      })

      // Then
      expect(result).toEqual({
        _id: getFolderId('/test'),
        _rev: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        data: { message: 'yolo' }
      })

      const doc = await client.db.get(getFolderId('/test'))
      expect(doc).toEqual({
        _id: getFolderId('/test'),
        _rev: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        data: { message: 'yolo' }
      })
    })

    it('does NOT update folder props if nothing to change', async () => {
      // Given
      const client = await createClient()
      const { createdAt, updatedAt, _rev } = await client.upsertFolder(
        '/test',
        { data: { message: 'yolo' } }
      )

      // When
      const result = await client.upsertFolder('/test')

      // Then
      expect(result).toEqual({
        _id: getFolderId('/test'),
        _rev,
        createdAt,
        updatedAt,
        data: { message: 'yolo' }
      })

      const doc = await client.db.get(getFolderId('/test'))
      expect(doc).toEqual({
        _id: getFolderId('/test'),
        _rev,
        createdAt,
        updatedAt,
        data: { message: 'yolo' }
      })
    })

    it('throws when pathname is invalid', async () => {
      // Given
      const client = await createClient()
      expect.assertions(1)

      // When
      try {
        await client.upsertFolder('/invalid?pathname')
      } catch (error) {
        // Then
        expect(error.message).toBe(
          'pathname is invalid, got `/invalid?pathname`'
        )
      }
    })
  })

  describe('#getTag', () => {
    it('returns a tag', async () => {
      // Given
      const client = await createClient()
      const now = new Date().toISOString()
      await client.db.put({
        _id: getTagId('test'),
        createdAt: now,
        updatedAt: now,
        data: {}
      })

      // When
      const result = await client.getTag('test')

      // Then
      expect(result).toEqual({
        _id: getTagId('test'),
        _rev: expect.any(String),
        createdAt: now,
        updatedAt: now,
        data: {}
      })
    })

    it('returns null if the tag does not exist', async () => {
      // Given
      const client = await createClient()

      // When
      const result = await client.getTag('test')

      // Then
      expect(result).toEqual(null)
    })
  })

  describe('#upsertTag', () => {
    it('creates a tag if it does not exist yet', async () => {
      // Given
      const client = await createClient()

      // When
      const result = await client.upsertTag('test', {
        data: { message: 'yolo' }
      })

      // Then
      expect(result).toEqual({
        _id: getTagId('test'),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        _rev: expect.any(String),
        data: {
          message: 'yolo'
        }
      })

      const doc = await client.getTag('test')
      expect(doc).toEqual({
        _id: getTagId('test'),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        _rev: expect.any(String),
        data: {
          message: 'yolo'
        }
      })
    })

    it('udpates tag props', async () => {
      // Given
      const client = await createClient()
      await client.upsertTag('test', {
        data: {}
      })

      // When
      const result = await client.upsertTag('test', {
        data: { message: 'yolo' }
      })

      // Then
      expect(result).toEqual({
        _id: getTagId('test'),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        _rev: expect.any(String),
        data: {
          message: 'yolo'
        }
      })

      const doc = await client.getTag('test')
      expect(doc).toEqual({
        _id: getTagId('test'),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        _rev: expect.any(String),
        data: {
          message: 'yolo'
        }
      })
    })

    it('does NOT update tag props if nothing to change', async () => {
      // Given
      const client = await createClient()
      const { createdAt, updatedAt, _rev } = await client.upsertTag('test', {
        data: {
          message: 'yolo'
        }
      })

      // When
      const result = await client.upsertTag('test')

      // Then
      expect(result).toEqual({
        _id: getTagId('test'),
        createdAt,
        updatedAt,
        _rev,
        data: {
          message: 'yolo'
        }
      })

      const doc = await client.getTag('test')
      expect(doc).toEqual({
        _id: getTagId('test'),
        createdAt,
        updatedAt,
        _rev,
        data: {
          message: 'yolo'
        }
      })
    })

    it('throws when tag name is invalid', async () => {
      // Given
      const client = await createClient()
      expect.assertions(1)

      // When
      try {
        await client.upsertTag('invalid tag')
      } catch (error) {
        // Then
        expect(error.message).toBe('tag name is invalid, got `invalid tag`')
      }
    })
  })

  describe('#getNote', () => {
    it('returns a note', async () => {
      // Given
      const client = await createClient()
      const noteId = generateNoteId()
      const now = new Date().toISOString()
      await client.db.put({
        _id: noteId,
        folderPathname: '/',
        tags: [],
        createdAt: now,
        updatedAt: now,
        movedToTrash: false,
        title: 'test title',
        content: 'test content',
        data: {}
      })

      // When
      const result = await client.getNote(noteId)

      // Then
      expect(result).toEqual({
        _id: noteId,
        _rev: expect.any(String),
        folderPathname: '/',
        tags: [],
        createdAt: now,
        updatedAt: now,
        movedToTrash: false,
        title: 'test title',
        content: 'test content',
        data: {}
      })
    })

    it('returns null if the note does not exist', async () => {
      // Given
      const client = await createClient()

      // When
      const result = await client.getNote('test')

      // Then
      expect(result).toEqual(null)
    })
  })

  describe('#createNote', () => {
    it('creates a note', async () => {
      // Given
      const client = await createClient()

      // When
      const result = await client.createNote({
        title: 'test title',
        content: 'test content'
      })

      // Then
      expect(result).toEqual({
        _id: expect.any(String),
        title: 'test title',
        content: 'test content',
        tags: [],
        folderPathname: '/',
        data: {},
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        trashed: false,
        _rev: expect.any(String)
      })

      const doc = await client.getNote(result._id)
      expect(doc).toEqual({
        _id: expect.any(String),
        title: 'test title',
        content: 'test content',
        tags: [],
        folderPathname: '/',
        data: {},
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        trashed: false,
        _rev: expect.any(String)
      })
    })

    it('creates missing tags and folder', async () => {
      // Given
      const client = await createClient()

      // When
      const result = await client.createNote({
        title: 'test title',
        content: 'test content',
        tags: ['test'],
        folderPathname: '/test'
      })

      // Then
      expect(result).toEqual({
        _id: expect.any(String),
        title: 'test title',
        content: 'test content',
        tags: ['test'],
        folderPathname: '/test',
        data: {},
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        trashed: false,
        _rev: expect.any(String)
      })

      const folder = await client.getFolder('/test')
      expect(folder).not.toBe(null)

      const tag = await client.getTag('test')
      expect(tag).not.toBe(null)
    })
  })

  describe('#updateNote', () => {
    it('updates a note', async () => {
      // Given
      const client = await createClient()
      const { _id } = await client.createNote({
        title: 'test title',
        content: 'test content'
      })

      // When
      const result = await client.updateNote(_id, {
        title: 'changed title',
        content: 'changed content'
      })

      // Then
      expect(result).toEqual({
        _id: expect.any(String),
        title: 'changed title',
        content: 'changed content',
        tags: [],
        folderPathname: '/',
        data: {},
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        trashed: false,
        _rev: expect.any(String)
      })

      const doc = await client.getNote(_id)
      expect(doc).toEqual({
        _id: expect.any(String),
        title: 'changed title',
        content: 'changed content',
        tags: [],
        folderPathname: '/',
        data: {},
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        trashed: false,
        _rev: expect.any(String)
      })
    })

    it('creates missing tags and missing folder', async () => {
      // Given
      const client = await createClient()
      const { _id } = await client.createNote({
        title: 'test title',
        content: 'test content',
        tags: ['old']
      })

      // When
      const result = await client.updateNote(_id, {
        title: 'changed title',
        content: 'changed content',
        folderPathname: '/new folder',
        tags: ['new']
      })

      // Then
      expect(result).toEqual({
        _id: expect.any(String),
        title: 'changed title',
        content: 'changed content',
        tags: ['new'],
        folderPathname: '/new folder',
        data: {},
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        trashed: false,
        _rev: expect.any(String)
      })

      const tag = await client.getTag('new')
      expect(tag).not.toBe(null)

      const folder = await client.getFolder('/new folder')
      expect(folder).not.toBe(null)
    })

    it('throws when the note does not exist', async () => {
      // Given
      const client = await createClient()
      expect.assertions(1)

      // When
      try {
        await client.updateNote('note:missing', {
          title: 'changed title',
          content: 'changed content'
        })
      } catch (error) {
        // Then
        expect(error.message).toBe('The note `note:missing` does not exist')
      }
    })
  })

  describe('findNotesByFolder', () => {
    it('returns notes in folders', async () => {
      // Given
      const client = await createClient()
      await client.init()
      const note1 = await client.createNote({
        title: 'test title1',
        content: 'test content1',
        folderPathname: '/test'
      })
      const note2 = await client.createNote({
        title: 'test title2',
        content: 'test content2',
        folderPathname: '/test'
      })
      await client.createNote({
        title: 'test title3',
        content: 'test content3',
        folderPathname: '/another folder'
      })

      // When
      const result = await client.findNotesByFolder('/test')

      expect(result).toEqual([
        {
          _id: note1._id,
          _rev: note1._rev,
          title: 'test title1',
          content: 'test content1',
          folderPathname: '/test',
          tags: [],
          data: {},
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          trashed: false
        },
        {
          _id: note2._id,
          _rev: note2._rev,
          title: 'test title2',
          content: 'test content2',
          folderPathname: '/test',
          tags: [],
          data: {},
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          trashed: false
        }
      ])
    })
  })

  describe('findNotesByTag', () => {
    it('returns notes in folders', async () => {
      // Given
      const client = await createClient()
      await client.init()
      const note1 = await client.createNote({
        title: 'test title1',
        content: 'test content1',
        folderPathname: '/',
        tags: ['tag1']
      })
      const note2 = await client.createNote({
        title: 'test title2',
        content: 'test content2',
        folderPathname: '/',
        tags: ['tag1', 'tag2']
      })
      const note3 = await client.createNote({
        title: 'test title3',
        content: 'test content3',
        folderPathname: '/',
        tags: ['tag2']
      })

      // When
      const result1 = await client.findNotesByTag('tag1')

      // Then
      expect(result1).toEqual([
        {
          _id: note1._id,
          _rev: note1._rev,
          title: 'test title1',
          content: 'test content1',
          folderPathname: '/',
          tags: ['tag1'],
          data: {},
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          trashed: false
        },
        {
          _id: note2._id,
          _rev: note2._rev,
          title: 'test title2',
          content: 'test content2',
          folderPathname: '/',
          tags: ['tag1', 'tag2'],
          data: {},
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          trashed: false
        }
      ])

      // When
      const result2 = await client.findNotesByTag('tag2')

      // Then
      expect(result2).toEqual([
        {
          _id: note2._id,
          _rev: note2._rev,
          title: 'test title2',
          content: 'test content2',
          folderPathname: '/',
          tags: ['tag1', 'tag2'],
          data: {},
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          trashed: false
        },
        {
          _id: note3._id,
          _rev: note3._rev,
          title: 'test title3',
          content: 'test content3',
          folderPathname: '/',
          tags: ['tag2'],
          data: {},
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          trashed: false
        }
      ])
    })
  })

  describe('trashNote', () => {
    it('trashes a note', async () => {
      // Given
      const client = await createClient()
      const note = await client.createNote({
        title: 'test title',
        content: 'test content'
      })

      // When
      const result = await client.trashNote(note._id)

      // Then
      expect(result).toMatchObject({
        _id: note._id,
        trashed: true
      })

      const doc = await client.db.get(note._id)
      expect(doc).toMatchObject({
        _id: note._id,
        trashed: true
      })
    })

    it('throws when the note does not exist', async () => {
      // Given
      const client = await createClient()
      expect.assertions(1)

      try {
        // When
        await client.trashNote('note:missing')
      } catch (error) {
        // Then
        expect(error.message).toBe('The note `note:missing` does not exist')
      }
    })
  })

  describe('untrashNote', () => {
    it('untrashes a note', async () => {
      // Given
      const client = await createClient()
      const note = await client.createNote({
        title: 'test title',
        content: 'test content'
      })

      // When
      const result = await client.untrashNote(note._id)

      // Then
      expect(result).toMatchObject({
        _id: note._id,
        trashed: false
      })

      const doc = await client.db.get(note._id)
      expect(doc).toMatchObject({
        _id: note._id,
        trashed: false
      })
    })

    it('restores missing folder of the note', async () => {
      // Given
      const client = await createClient()
      const noteId = generateNoteId()
      const now = getNow()
      await client.db.put<ExceptRev<NoteData>>({
        _id: noteId,
        folderPathname: '/missing folder',
        tags: [],
        createdAt: now,
        updatedAt: now,
        trashed: true,
        title: 'test title',
        content: 'test content',
        data: {}
      })

      // When
      const result = await client.untrashNote(noteId)

      // Then
      expect(result).toMatchObject({
        _id: noteId,
        trashed: false
      })

      const doc = await client.db.get(noteId)
      expect(doc).toMatchObject({
        _id: noteId,
        trashed: false
      })

      const folderDoc = await client.getFolder('/missing folder')
      expect(folderDoc).not.toBe(null)
    })

    it('throws when the note does not exist', async () => {
      // Given
      const client = await createClient()
      expect.assertions(1)

      try {
        // When
        await client.untrashNote('note:missing')
      } catch (error) {
        // Then
        expect(error.message).toBe('The note `note:missing` does not exist')
      }
    })
  })

  describe('purgeNote', () => {
    it('delete a note', async () => {
      // Given
      const client = await createClient()
      const note = await client.createNote({
        title: 'test title',
        content: 'test content'
      })

      // When
      await client.purgeNote(note._id)

      // Then
      const doc = await client.getNote(note._id)
      expect(doc).toBe(null)
    })

    it('throws when the note does not exist', async () => {
      // Given
      const client = await createClient()
      expect.assertions(1)

      try {
        // When
        await client.purgeNote('note:missing')
      } catch (error) {
        // Then
        expect(error.message).toBe('The note `note:missing` does not exist')
      }
    })
  })

  describe('removeTag', () => {
    it('removes tag and updates notes with the tag', async () => {
      // Given
      const client = await createClient()
      await client.init()
      const note1 = await client.createNote({
        title: 'test title1',
        content: 'test content1',
        folderPathname: '/',
        tags: ['tag1']
      })
      const note2 = await client.createNote({
        title: 'test title2',
        content: 'test content2',
        folderPathname: '/',
        tags: ['tag1', 'tag2']
      })

      // When
      await client.removeTag('tag1')

      // Then
      const storedNote1 = await client.getNote(note1._id)
      expect(storedNote1).toMatchObject({
        tags: []
      })

      const storedNote2 = await client.getNote(note2._id)
      expect(storedNote2).toMatchObject({
        tags: ['tag2']
      })
    })
  })

  describe('removeFolder', () => {
    it('removes a folder and its notes', async () => {
      // Given
      const client = await createClient()
      await client.init()
      const note = await client.createNote({
        title: 'test title1',
        content: 'test content1',
        folderPathname: '/test'
      })

      // When
      await client.removeFolder('/test')

      // Then
      const storedFolder = await client.getFolder('/test')
      expect(storedFolder).toBe(null)

      const storedNote = await client.getNote(note._id)
      expect(storedNote).toMatchObject({
        trashed: true
      })
    })

    it('removes child folders and their notes too', async () => {
      // Given
      const client = await createClient(true)
      const note1 = await client.createNote({
        title: 'test title1',
        content: 'test content1',
        folderPathname: '/test'
      })
      const note2 = await client.createNote({
        title: 'test title2',
        content: 'test content2',
        folderPathname: '/test/child folder'
      })

      // When
      await client.removeFolder('/test')

      // Then
      const storedFolder = await client.getFolder('/test')
      expect(storedFolder).toBe(null)

      const storedChildFolder = await client.getFolder('/test/child folder')
      expect(storedChildFolder).toBe(null)

      const storedNote1 = await client.getNote(note1._id)
      expect(storedNote1).toMatchObject({
        trashed: true
      })

      const storedNote2 = await client.getNote(note2._id)
      expect(storedNote2).toMatchObject({
        trashed: true
      })
    })
  })

  describe('getAllFolderUnderPathname', () => {
    it('returns list of a folder and its child folders', async () => {
      // Given
      const client = await createClient(true)
      await client.upsertFolder('/test/child folder')
      await client.upsertFolder('/test2')

      // When
      const result = await client.getAllFolderUnderPathname('/test')

      // Then
      expect(result).toEqual([
        expect.objectContaining({
          _id: getFolderId('/test')
        }),
        expect.objectContaining({
          _id: getFolderId('/test/child folder')
        })
      ])
    })
  })

  describe('trashAllNotesInFolder', () => {
    it('trashes all notes in the folder', async () => {
      // Given
      const client = await createClient(true)
      const note1 = await client.createNote({
        title: 'test title1',
        content: 'test content1',
        folderPathname: '/test'
      })
      const note2 = await client.createNote({
        title: 'test title2',
        content: 'test content2',
        folderPathname: '/test'
      })
      const note3 = await client.createNote({
        title: 'test title3',
        content: 'test content3',
        folderPathname: '/test2'
      })

      // When
      await client.trashAllNotesInFolder('/test')

      // Then
      const storedNote1 = await client.getNote(note1._id)
      expect(storedNote1).toMatchObject({
        trashed: true
      })
      const storedNote2 = await client.getNote(note2._id)
      expect(storedNote2).toMatchObject({
        trashed: true
      })

      const storedNote3 = await client.getNote(note3._id)
      expect(storedNote3).toMatchObject({
        trashed: false
      })
    })
  })
})
