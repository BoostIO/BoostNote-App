import { getStorageItemId, getFolderItemId, getTagListItemId } from '../nav'

describe('getStorageItemId', () => {
  it('returns a correct storage path', () => {
    expect(getStorageItemId('test_storage')).toBe('storage:test_storage')
  })
})

describe('getFolderItemId', () => {
  it('returns a correct folder item path', () => {
    expect(getFolderItemId('test_storage', 'test_folder')).toBe(
      'storage:test_storage/folder:test_folder'
    )
  })
})

describe('getTagListItemId', () => {
  it('returns a correct tags path', () => {
    expect(getTagListItemId('test_storage')).toBe('storage:test_storage/tags')
  })
})
