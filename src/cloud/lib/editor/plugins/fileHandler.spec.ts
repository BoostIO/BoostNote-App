import { isDirectoryTransferItem } from './fileHandler'

describe('isDirectoryTransferItem', () => {
  it('detects directory transfer items', () => {
    const item = {
      webkitGetAsEntry: () => ({ isDirectory: true }),
    } as DataTransferItem

    expect(isDirectoryTransferItem(item)).toBe(true)
  })

  it('ignores file transfer items', () => {
    const item = {
      webkitGetAsEntry: () => ({ isDirectory: false }),
    } as DataTransferItem

    expect(isDirectoryTransferItem(item)).toBe(false)
  })

  it('ignores transfer items without entry support', () => {
    expect(isDirectoryTransferItem({} as DataTransferItem)).toBe(false)
  })
})
