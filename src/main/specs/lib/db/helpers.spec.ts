import {
  getParentFolderPath,
  normalizeFolderPath
} from '../../../lib/db/helpers'

describe('helpers', () => {

  describe('getParentPath', () => {
    it('gets a parent path', () => {
      expect(getParentFolderPath('/test')).toEqual('/')
      expect(getParentFolderPath('/test/test')).toEqual('/test')
    })

    it('throws when the given path is root path', () => {
      expect(() => {
        getParentFolderPath('/')
      }).toThrow()
    })
  })

  describe('normalizeFolderPath', () => {
    it('normalizes a folder path', () => {
      expect(normalizeFolderPath('/')).toEqual('/')
      expect(normalizeFolderPath('/test')).toEqual('/test')
      expect(normalizeFolderPath('test/')).toEqual('/test')
      expect(normalizeFolderPath('test/test')).toEqual('/test/test')
      expect(normalizeFolderPath('/test/test')).toEqual('/test/test')
      expect(normalizeFolderPath('test/test/')).toEqual('/test/test')
    })
  })
})
