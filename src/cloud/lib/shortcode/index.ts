import { Node } from 'unist'

export function shortcodeRehypeHandler(h: Function, node: Node) {
  const attrs = typeof node.attributes === 'object' ? node.attributes : {}
  return h(node.position, 'shortcode', {
    identifier: node.identifier,
    entityId: (attrs as any).id,
    ...attrs,
  })
}
