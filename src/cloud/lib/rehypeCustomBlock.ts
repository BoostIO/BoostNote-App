import visit from 'unist-util-visit'
import unified from 'unified'

const componentRegex = /^\<([\w]+) \/\>$/m

export const remarkCustomBlock: unified.Plugin = function () {
  return (tree) => {
    visit(tree, 'root', (node) => {
      ;(node.children as any).forEach((child: any) => {
        if (child.type === 'html' && componentRegex.test(child.value)) {
          child.type = 'paragraph'
          child.children = [{ type: 'text', value: child.value }]
        }
      })
    })
  }
}

export const rehypeCustomBlockTransform: unified.Plugin = function () {
  return (tree) => {
    visit(tree, 'root', (node) => {
      ;(node as any).children.forEach((child: any) => {
        if (
          child.tagName === 'p' &&
          Array.isArray(child.children) &&
          child.children.length === 1 &&
          child.children[0].type === 'text'
        ) {
          const matched = componentRegex.exec(child.children[0].value)
          if (matched != null) {
            child.tagName = 'custom_block'
            child.properties.name = matched[1]
          }
        }
      })
      return true
    })
  }
}
