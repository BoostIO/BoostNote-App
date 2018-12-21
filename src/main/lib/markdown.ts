import unified from 'unified'
import parse from 'remark-parse'
import frontmatter from 'remark-frontmatter'
import parseYaml from 'remark-parse-yaml'
import visit from 'unist-util-visit'
import toString from 'mdast-util-to-string'

const processor = unified()
  .use(parse)
  .use(frontmatter)
  .use(parseYaml)

function hasYamlNode(node: any) {
  if (node.children[0] == null) return false
  return node.children[0].type === 'yaml'
}

function hasYamlTitle(node: any) {
  if (!hasYamlNode(node)) return false
  return node.children[0].data.parsedValue.title != null
}

function hasYamlTags(node: any) {
  if (!hasYamlNode(node)) return false
  return node.children[0].data.parsedValue.tags != null
}

interface MetaData {
  title: string
  tags: string[]
}

export function getMetaData(value: string): MetaData {
  const parsedNode = processor.parse(value)
  const transformedNode = processor.runSync(parsedNode)
  const title = getTitleFromNode(transformedNode)
  const tags = getTagsFromNode(transformedNode)

  return {
    title,
    tags
  }
}

export function getTitleFromNode(node: any): string {
  if (hasYamlTitle(node)) {
    return node.children[0]!.data.parsedValue.title
  }

  let title: string = ''
  visit(node, 'heading', (headingNode: any) => {
    title = toString(headingNode)
    if (title.length > 0) {
      return visit.EXIT
    } else {
      return visit.CONTINUE
    }
  })
  if (title.length > 0) return title

  visit(node, 'text', (literalNode: any) => {
    title = toString(literalNode)
    if (title.length > 0) {
      return visit.EXIT
    } else {
      return visit.CONTINUE
    }
  })

  return title
}

export function getTagsFromNode(node: any): string[] {
  if (!hasYamlTags(node)) return []

  const unknownTags: unknown = node.children[0].data.parsedValue.tags
  if (typeof unknownTags === 'string') return [unknownTags]
  if (Array.isArray(unknownTags))
    return unknownTags.filter(unknownTag => typeof unknownTag === 'string')
  return []
}
