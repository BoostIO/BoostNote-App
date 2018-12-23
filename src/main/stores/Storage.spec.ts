import Storage from './Storage'
import { FOLDER_ID_PREFIX, NOTE_ID_PREFIX } from '../consts'

describe('Storage', () => {
  describe('addFolder', () => {
    it('adds a folder', () => {
      // Given
      const storage = new Storage()
      const now = new Date()

      // When
      storage.addFolder({
        _id: 'boost:folder:/test',
        path: '/test',
        createdAt: now,
        updatedAt: now,
        _rev: ''
      })

      // Then
      const data = storage.folderMap.get('boost:folder:/test')
      expect(data).toMatchObject({
        _id: 'boost:folder:/test',
        createdAt: now,
        updatedAt: now,
        _rev: ''
      })
    })

    it('adds folders', () => {
      // Given
      const storage = new Storage()
      const now = new Date()
      const folder1 = {
        _id: 'boost:folder:/test',
        path: '/test',
        createdAt: now,
        updatedAt: now,
        _rev: ''
      }
      const folder2 = {
        _id: 'boost:folder:/test2',
        path: '/test2',
        createdAt: now,
        updatedAt: now,
        _rev: ''
      }

      // When
      storage.addFolder(folder1, folder2)

      // Then
      const data1 = storage.folderMap.get('boost:folder:/test')
      expect(data1).toMatchObject({
        _id: 'boost:folder:/test',
        createdAt: now,
        updatedAt: now,
        _rev: ''
      })
      const data2 = storage.folderMap.get('boost:folder:/test2')
      expect(data2).toMatchObject({
        _id: 'boost:folder:/test2',
        createdAt: now,
        updatedAt: now,
        _rev: ''
      })
    })
  })

  describe('removeFolder', () => {
    it('removes a folder', () => {
      // Given
      const storage = new Storage()
      const now = new Date()
      storage.addFolder(
        {
          _id: `${FOLDER_ID_PREFIX}/`,
          path: '/',
          createdAt: now,
          updatedAt: now,
          _rev: ''
        },
        {
          _id: `${FOLDER_ID_PREFIX}/test`,
          path: '/test',
          createdAt: now,
          updatedAt: now,
          _rev: ''
        }
      )

      // When
      storage.removeFolder('/test')

      // Then
      expect(storage.folderMap.has(`${FOLDER_ID_PREFIX}/test`)).toBe(false)
    })

    it('removes all sub folders', () => {
      // Given
      const storage = new Storage()
      const now = new Date()
      storage.addFolder(
        {
          _id: `${FOLDER_ID_PREFIX}/`,
          path: '/',
          createdAt: now,
          updatedAt: now,
          _rev: ''
        },
        {
          _id: `${FOLDER_ID_PREFIX}/test`,
          path: '/test',
          createdAt: now,
          updatedAt: now,
          _rev: ''
        },
        {
          _id: `${FOLDER_ID_PREFIX}/test/test`,
          path: '/test/test',
          createdAt: now,
          updatedAt: now,
          _rev: ''
        },
        {
          _id: `${FOLDER_ID_PREFIX}/test2`,
          path: '/test2',
          createdAt: now,
          updatedAt: now,
          _rev: ''
        }
      )

      // When
      storage.removeFolder('/test')

      // Then
      expect(storage.folderMap.has(`${FOLDER_ID_PREFIX}/test/test`)).toBe(false)
      expect(storage.folderMap.has(`${FOLDER_ID_PREFIX}/test2`)).toBe(true)
    })

    it('removes all notes in folder', () => {
      // Given
      const storage = new Storage()
      const now = new Date()
      storage.addFolder(
        {
          _id: `${FOLDER_ID_PREFIX}/`,
          path: '/',
          createdAt: now,
          updatedAt: now,
          _rev: ''
        },
        {
          _id: `${FOLDER_ID_PREFIX}/test`,
          path: '/test',
          createdAt: now,
          updatedAt: now,
          _rev: ''
        }
      )
      storage.addNote({
        _id: `${NOTE_ID_PREFIX}:test`,
        folder: '/test',
        title: '',
        content: '',
        tags: [],
        createdAt: now,
        updatedAt: now,
        _rev: ''
      })

      // When
      storage.removeFolder('/test')

      // Then
      expect(storage.noteMap.has(`${NOTE_ID_PREFIX}:test`)).toBe(false)
    })

    it('removes all notes in sub folders', () => {
      // Given
      const storage = new Storage()
      const now = new Date()
      storage.addFolder(
        {
          _id: `${FOLDER_ID_PREFIX}/`,
          path: '/',
          createdAt: now,
          updatedAt: now,
          _rev: ''
        },
        {
          _id: `${FOLDER_ID_PREFIX}/test`,
          path: '/test',
          createdAt: now,
          updatedAt: now,
          _rev: ''
        },
        {
          _id: `${FOLDER_ID_PREFIX}/test/test`,
          path: '/test/test',
          createdAt: now,
          updatedAt: now,
          _rev: ''
        }
      )
      storage.addNote({
        _id: `${NOTE_ID_PREFIX}:test`,
        folder: '/test/test',
        title: '',
        content: '',
        tags: [],
        createdAt: now,
        updatedAt: now,
        _rev: ''
      })

      // When
      storage.removeFolder('/test')

      // Then
      expect(storage.noteMap.has(`${NOTE_ID_PREFIX}:test`)).toBe(false)
    })
  })

  describe('addNote', () => {
    it('adds a note', () => {
      // Given
      const storage = new Storage()
      const now = new Date()

      // When
      storage.addNote({
        _id: 'note:test',
        title: 'title',
        content: 'content',
        tags: [],
        folder: '/test',
        createdAt: now,
        updatedAt: now,
        _rev: ''
      })

      // Then
      const data = storage.noteMap.get('note:test')
      expect(data).toEqual({
        _id: 'note:test',
        title: 'title',
        content: 'content',
        tags: [],
        folder: '/test',
        createdAt: now,
        updatedAt: now,
        _rev: ''
      })
    })

    it('adds notes', () => {
      // Given
      const storage = new Storage()
      const now = new Date()
      const note1 = {
        _id: 'note:test1',
        title: 'title1',
        content: 'content2',
        tags: [] as string[],
        folder: '/test',
        createdAt: now,
        updatedAt: now,
        _rev: ''
      }
      const note2 = {
        _id: 'note:test2',
        title: 'title2',
        content: 'content2',
        tags: [] as string[],
        folder: '/test',
        createdAt: now,
        updatedAt: now,
        _rev: ''
      }

      // When
      storage.addNote(note1, note2)

      // Then
      const data1 = storage.noteMap.get('note:test1')
      expect(data1).toEqual({
        _id: 'note:test1',
        title: 'title1',
        content: 'content2',
        tags: [],
        folder: '/test',
        createdAt: now,
        updatedAt: now,
        _rev: ''
      })
      const data2 = storage.noteMap.get('note:test2')
      expect(data2).toEqual({
        _id: 'note:test2',
        title: 'title2',
        content: 'content2',
        tags: [],
        folder: '/test',
        createdAt: now,
        updatedAt: now,
        _rev: ''
      })
    })

    it('binds note id to tags', () => {
      // Given
      const storage = new Storage()
      const now = new Date()

      // When
      storage.addNote({
        _id: 'note:test',
        title: 'title',
        content: 'content',
        tags: ['test1', 'test2'],
        folder: '/test',
        createdAt: now,
        updatedAt: now,
        _rev: ''
      })

      // Then
      const test1TagNoteIdSet = storage.tagNoteIdSetMap.get('test1')!
      expect(getValuesFromSet(test1TagNoteIdSet)).toEqual(['note:test'])
      const test2TagNoteIdSet = storage.tagNoteIdSetMap.get('test2')!
      expect(getValuesFromSet(test2TagNoteIdSet)).toEqual(['note:test'])
    })

    it('updates biding after tags changed', () => {
      // Given
      const storage = new Storage()
      const now = new Date()
      storage.addNote({
        _id: 'note:test',
        title: 'title',
        content: 'content',
        tags: ['test1', 'test2'],
        folder: '/test',
        createdAt: now,
        updatedAt: now,
        _rev: ''
      })

      // When
      storage.addNote({
        _id: 'note:test',
        title: 'title',
        content: 'content',
        tags: ['test2', 'test3'],
        folder: '/test',
        createdAt: now,
        updatedAt: now,
        _rev: ''
      })

      // Then
      const test1TagNoteIdSet = storage.tagNoteIdSetMap.get('test1')
      expect(test1TagNoteIdSet).toBeUndefined()
      const test2TagNoteIdSet = storage.tagNoteIdSetMap.get('test2')!
      expect(getValuesFromSet(test2TagNoteIdSet)).toEqual(['note:test'])
      const test3TagNoteIdSet = storage.tagNoteIdSetMap.get('test3')!
      expect(getValuesFromSet(test3TagNoteIdSet)).toEqual(['note:test'])
    })
  })
})

function getValuesFromSet(set: Map<string, string>): string[] {
  return [...set.values()]
}
