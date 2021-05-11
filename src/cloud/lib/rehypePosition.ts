import unified from 'unified'
import visit from 'unist-util-visit'

export const rehypePosition: unified.Plugin = function () {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.position != null) {
        if (node.properties == null) {
          node.properties = {}
        }
        ;(node.properties as any)['data-line'] = node.position.start.line
        if (node.position.start.offset != null) {
          ;(node.properties as any)['data-offset'] = node.position.start.offset
        }
      }
    })
  }
}
