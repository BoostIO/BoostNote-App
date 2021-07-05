import { SerializedUser } from '../../interfaces/db/user'

type CommentNode =
  | { type: 'text'; value: string }
  | { type: 'mention'; id: string; name: string }

export function toText(comment: string, users: SerializedUser[] = []) {
  const map = new Map(users.map((user) => [user.id, user]))
  return parse(comment).map((node) => {
    switch (node.type) {
      case 'text':
        return node.value
      case 'mention': {
        const user = map.get(node.id)
        return `@${user != null ? user.displayName : node.name}`
      }
    }
  })
}

export function makeMentionElement(id: string, defaultName: string) {
  const mentionNode = document.createElement('span')
  mentionNode.setAttribute('data-mention', id)
  mentionNode.setAttribute('data-label', `@${defaultName}`)
  mentionNode.appendChild(document.createTextNode(`@${defaultName}`))
  mentionNode.addEventListener('focus', () => console.log('afafawfaf'))
  return mentionNode
}

export function toFragment(comment: string) {
  const fragment = document.createDocumentFragment()
  for (const line of comment.split('\n')) {
    const child = document.createElement('div')
    const content = parse(line)
    for (const node of content) {
      if (node.type == 'text') {
        child.appendChild(document.createTextNode(node.value))
      } else {
        child.appendChild(makeMentionElement(node.id, node.name))
      }
    }

    fragment.appendChild(child)
  }
  return fragment
}

export function fromNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent || ''
  }

  if (!isElement(node)) {
    return ''
  }

  if (isMention(node)) {
    const label = node.getAttribute('data-label') || ''
    return `:m:${node.getAttribute('data-mention')}:${
      label.startsWith('@') ? label.substr(1) : label
    }:m:`
  }

  const result = []
  for (let i = 0; i < node.childNodes.length; i++) {
    result.push(fromNode(node.childNodes[i]))
  }

  if (node.tagName === 'DIV') {
    result.push('\n')
  }

  return result.join('')
}

export function isMention(node: Node) {
  return (
    isElement(node) &&
    node.tagName === 'SPAN' &&
    node.hasAttribute('data-mention') &&
    node.hasAttribute('data-label')
  )
}

function isElement(node: Node): node is Element {
  return node.nodeType === Node.ELEMENT_NODE
}

function parse(text: string): CommentNode[] {
  return text.split(':m:').map((str) => {
    if (str.includes(':')) {
      const split = str.split(':')
      if (split.length === 2) {
        return {
          type: 'mention',
          id: split[0],
          name: split[1],
        }
      }
    }
    return { type: 'text', value: str }
  })
}
