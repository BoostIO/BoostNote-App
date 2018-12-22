import unified from 'unified'
import parse from 'remark-parse'
import frontmatter from 'remark-frontmatter'
import parseYaml from 'remark-parse-yaml'
import { getMetaData, getTitleFromNode, getTagsFromNode } from './markdown'

const processor = unified()
  .use(parse)
  .use(frontmatter)
  .use(parseYaml)

function parseAndTransform(value: string) {
  const parsedNode = processor.parse(value)
  const transformedNode = processor.runSync(parsedNode)
  return transformedNode
}

describe('markdown', () => {
  describe('getMetaData', () => {
    it('returns meta data from string', () => {
      // Given
      // prettier-ignore
      const value = [
        '---',
        'title: yaml title',
        'tags: [test, tags]',
        '---',
        '',
        '# test',
        ''
      ].join('\n')

      // When
      const metaData = getMetaData(value)

      // Then
      expect(metaData).toEqual({
        title: 'yaml title',
        tags: ['test', 'tags']
      })
    })
  })

  describe('getTitleFromNode', () => {
    it('returns title from content of the first heading node if there is no yaml title', () => {
      // Given
      // prettier-ignore
      const node = parseAndTransform([
        '---',
        'otherValue: test',
        '---',
        '',
        '# heading title',
        '',
        '## another heading',
        ''
      ].join('\n'))

      // When
      const title = getTitleFromNode(node)

      // Then
      expect(title).toBe('heading title')
    })

    it('returns title from content of the first line if there is not heading node nor yaml title', () => {
      // Given
      // prettier-ignore
      const node = parseAndTransform([
        '---',
        'otherValue: test',
        '---',
        '',
        'no title',
        ''
      ].join('\n'))

      // When
      const title = getTitleFromNode(node)

      // Then
      expect(title).toBe('no title')
    })
  })

  describe('getTagsFromNode', () => {
    it('parses tags as string', () => {
      // Given
      // prettier-ignore
      const node = parseAndTransform([
        '---',
        'tags: test',
        '---',
        ''
      ].join('\n'))

      // When
      const tags = getTagsFromNode(node)

      // Then
      expect(tags).toEqual(['test'])
    })

    it('parses tags as string array', () => {
      // Given
      // prettier-ignore
      const node = parseAndTransform([
        '---',
        'tags: [test, tags, 123]',
        '---',
        ''
      ].join('\n'))

      // When
      const tags = getTagsFromNode(node)

      // Then
      expect(tags).toEqual(['test', 'tags', '123'])
    })

    it('ignores non string value in array', () => {
      // Given
      // prettier-ignore
      const node = parseAndTransform([
        '---',
        'tags: [test, [123]]',
        '---',
        ''
      ].join('\n'))

      // When
      const tags = getTagsFromNode(node)

      // Then
      expect(tags).toEqual(['test'])
    })

    it('ignores duplicated entity', () => {
      // Given
      // prettier-ignore
      const node = parseAndTransform([
        '---',
        'tags: [test, test]',
        '---',
        ''
      ].join('\n'))

      // When
      const tags = getTagsFromNode(node)

      // Then
      expect(tags).toEqual(['test'])
    })
  })
})
