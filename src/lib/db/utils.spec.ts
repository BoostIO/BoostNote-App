import {
  isFolderNameValid,
  isFolderPathnameValid,
  getFolderId,
  getFolderPathname,
  getTagId,
  getTagName,
  isTagNameValid,
  getAllParentFolderPathnames
} from './utils'

describe('getFolderId', () => {
  it('returns folder id from pathname', () => {
    const result = getFolderId('/test')

    expect(result).toBe('folder:/test')
  })
})

describe('getFolderPathname', () => {
  it('returns folder pathname from id', () => {
    const result = getFolderPathname('folder:/test')

    expect(result).toBe('/test')
  })
})

describe('getTagId', () => {
  it('returns tag id from name', () => {
    const result = getTagId('test')

    expect(result).toBe('tag:test')
  })
})

describe('getTagname', () => {
  it('returns tag name from id', () => {
    const result = getTagName('tag:test')

    expect(result).toBe('test')
  })
})

describe('isFolderNameValid', () => {
  it('returns false when invalid(including invalid characters)', () => {
    const result = isFolderNameValid('/not/valid')

    expect(result).toBe(false)
  })

  it('returns false when invalid(empty)', () => {
    const result = isFolderNameValid('')

    expect(result).toBe(false)
  })

  it('returns true when valid', () => {
    const result = isFolderNameValid('valid')

    expect(result).toBe(true)
  })
})

describe('isFolderPathnameValid', () => {
  it('returns false when invalid(empty)', () => {
    const result = isFolderPathnameValid('')

    expect(result).toBe(false)
  })

  it('returns false when invalid(double slash)', () => {
    const result = isFolderPathnameValid('/not//valid')

    expect(result).toBe(false)
  })

  it('returns false when invalid(invalid folder name)', () => {
    const result = isFolderPathnameValid('/not?valid')

    expect(result).toBe(false)
  })

  it('returns false when invalid(relative pathname)', () => {
    const result = isFolderPathnameValid('not/valid')

    expect(result).toBe(false)
  })

  it('returns true when valid', () => {
    const result = isFolderPathnameValid('/valid')

    expect(result).toBe(true)
  })
})

describe('isTagNameValid', () => {
  it('returns false when invalid(including invalid characters)', () => {
    const result = isTagNameValid('not valid')

    expect(result).toBe(false)
  })

  it('returns false when invalid(empty)', () => {
    const result = isTagNameValid('')

    expect(result).toBe(false)
  })

  it('returns true when valid', () => {
    const result = isTagNameValid('valid')

    expect(result).toBe(true)
  })
})

describe('getAllParentFolderPathnames', () => {
  it('returns array of all parent pathnames', () => {
    const input = '/a/b/c/d/e/f'

    const result = getAllParentFolderPathnames(input)

    expect(result).toEqual(['/a/b/c/d/e', '/a/b/c/d', '/a/b/c', '/a/b', '/a'])
  })
})
