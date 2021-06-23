import { SerializedUser } from '../../interfaces/db/user'

const mentionRegex = /:m:(\S+):(.*?):m:/g
const fullCapturingMentionRegex = /(:m:\S+:.*?:m:)/

export function toText(comment: string, users: SerializedUser[] = []) {
  const map = new Map(users.map((user) => [user.id, user]))

  return comment.replace(mentionRegex, (_match, id, placeholder) => {
    return `@${map.get(id)?.displayName || placeholder}`
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
    const content = line.split(fullCapturingMentionRegex)
    for (const part of content) {
      const match = mentionRegex.exec(part)
      if (match == null) {
        child.appendChild(document.createTextNode(part))
      } else {
        child.appendChild(makeMentionElement(match[1], match[2]))
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
