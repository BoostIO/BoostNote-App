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
  return node.children[0]!.type === 'yaml'
}
function hasYamlTitle(node: any) {
  return node.children[0]!.data.parsedValue.title != null
}

export function getTitle(value: string) {
  const parsedNode = processor.parse(value)
  const transformedNode = processor.runSync(parsedNode)

  if ((hasYamlNode(transformedNode), hasYamlTitle(transformedNode))) {
    return transformedNode.children[0]!.data.parsedValue.title
  }

  let title: string = ''
  visit(transformedNode, 'heading', (node: any) => {
    title = toString(node)
    if (title.length > 0) {
      return visit.EXIT
    } else {
      return visit.CONTINUE
    }
  })
  if (title.length > 0) return title

  visit(transformedNode, 'text', (node: any) => {
    title = toString(node)
    if (title.length > 0) {
      return visit.EXIT
    } else {
      return visit.CONTINUE
    }
  })

  return title
}
