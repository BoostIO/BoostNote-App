import unified from 'unified'
import parse from 'remark-parse'
import frontmatter from 'remark-frontmatter'
import parseYaml from 'remark-parse-yaml'
import visit from 'unist-util-visit'
import convertMdastToString from 'mdast-util-to-string'
import { pipe, filter, map, uniq } from 'ramda'

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
    title = convertMdastToString(headingNode)
    if (title.length > 0) {
      return visit.EXIT
    } else {
      return visit.CONTINUE
    }
  })
  if (title.length > 0) return title

  visit(node, 'text', (literalNode: any) => {
    title = convertMdastToString(literalNode)
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
  if (isStringOrNumber(unknownTags)) return [unknownTags.toString()]
  if (Array.isArray(unknownTags)) {
    return filterTags(unknownTags)
  }
  return []
}

const filterTags = pipe(
  filter(isStringOrNumber),
  map(value => value.toString()),
  uniq
)

function isStringOrNumber(value: any): value is string | number {
  return typeof value === 'string' || typeof value === 'number'
}
