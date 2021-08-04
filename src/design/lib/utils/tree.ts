type Node<T> = T & { children: Node<T>[] }

export function find<T extends Node<any>>(
  node: Node<T>,
  cmp: (node: Node<T>) => boolean
): Node<T> | null {
  if (cmp(node)) {
    return node
  }

  for (const child of node.children) {
    const found = find(child, cmp)
    if (found != null) {
      return found
    }
  }

  return null
}
