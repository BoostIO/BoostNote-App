import { Node } from 'unist'

function rehypeGutters(contentFactory: (node: Node) => Node | null) {
  return (tree: Node) => {
    tree.children = (tree.children as Node[]).map((node) => {
      const content = contentFactory(node)
      if (content == null) {
        return node
      }
      return {
        type: 'element',
        tagName: 'div',
        properties: {
          class: 'with__gutter',
        },
        children: [
          node,
          {
            type: 'element',
            tagName: 'div',
            children: [content],
            properties: { class: 'block__gutter', position: node.position },
          },
        ],
      }
    })
  }
}

export default rehypeGutters
