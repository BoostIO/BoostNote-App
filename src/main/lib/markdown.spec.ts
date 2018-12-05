import { getTitle } from './markdown'

describe('markdown', () => {
  describe('getTitle', () => {
    it('finds title from yaml if it defined', () => {
      // Given
      // prettier-ignore
      const value = [
        '---',
        'title: yaml title',
        '---',
        '',
        '# test',
        ''
      ].join('\n')

      // When
      const title = getTitle(value)

      // Then
      expect(title).toBe('yaml title')
    })

    it('finds title from content of the first heading node', () => {
      // Given
      // prettier-ignore
      const value = [
        '---',
        'otherValue: test',
        '---',
        '',
        '# heading title',
        '',
        '## another heading',
        ''
      ].join('\n')

      // When
      const title = getTitle(value)

      // Then
      expect(title).toBe('heading title')
    })

    it('finds title from content of the first line', () => {
      // Given
      // prettier-ignore
      const value = [
        '---',
        'otherValue: test',
        '---',
        '',
        'no title',
        ''
      ].join('\n')

      // When
      const title = getTitle(value)

      // Then
      expect(title).toBe('no title')
    })
  })
})
