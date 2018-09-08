import Storage from '../../stores/Storage'

describe('Storage', () => {
  describe('addFolder', () => {
    it('adds a folder' , () => {
      // Given
      const storage = new Storage()
      const now = new Date()

      // When
      storage.addFolder({
        _id: 'folder:/test',
        createdAt: now,
        updatedAt: now,
        _rev: ''
      })

      // Then
      const data = storage.folderMap.get('folder:/test')
      expect(data).toEqual({
        _id: 'folder:/test',
        createdAt: now,
        updatedAt: now,
        _rev: ''
      })
    })

    it('adds folders' , () => {
      // Given
      const storage = new Storage()
      const now = new Date()
      const folder1 = {
        _id: 'folder:/test',
        createdAt: now,
        updatedAt: now,
        _rev: ''
      }
      const folder2 = {
        _id: 'folder:/test2',
        createdAt: now,
        updatedAt: now,
        _rev: ''
      }

      // When
      storage.addFolder(folder1, folder2)

      // Then
      const data1 = storage.folderMap.get('folder:/test')
      expect(data1).toEqual({
        _id: 'folder:/test',
        createdAt: now,
        updatedAt: now,
        _rev: ''
      })
      const data2 = storage.folderMap.get('folder:/test2')
      expect(data2).toEqual({
        _id: 'folder:/test2',
        createdAt: now,
        updatedAt: now,
        _rev: ''
      })
    })
  })

  describe('addNote', () => {
    it('adds a note' , () => {
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

    it('adds notes' , () => {
      // Given
      const storage = new Storage()
      const now = new Date()
      const note1 = {
        _id: 'note:test1',
        title: 'title1',
        content: 'content2',
        tags: [],
        folder: '/test',
        createdAt: now,
        updatedAt: now,
        _rev: ''
      }
      const note2 = {
        _id: 'note:test2',
        title: 'title2',
        content: 'content2',
        tags: [],
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
  })
})
