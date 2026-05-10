const blockTags = new Set([
  'ADDRESS',
  'ARTICLE',
  'ASIDE',
  'BLOCKQUOTE',
  'DIV',
  'FIGURE',
  'FOOTER',
  'FORM',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'HEADER',
  'HR',
  'MAIN',
  'P',
  'PRE',
  'SECTION',
  'TABLE',
])

const escapeMarkdown = (value: string) => {
  return value.replace(/([\\`*_{}[\]()#+\-.!|>])/g, '\\$1')
}

const escapeLinkTitle = (value: string) => {
  return value.replace(/"/g, '\\"')
}

const normalizeInlineWhitespace = (value: string) => {
  return value.replace(/\s+/g, ' ')
}

const joinBlock = (value: string) => {
  const trimmed = value.trim()
  return trimmed.length > 0 ? `\n\n${trimmed}\n\n` : ''
}

const listItem = (value: string) => {
  const trimmed = value.trim()
  return trimmed.length > 0 ? `- ${trimmed}\n` : ''
}

const nodeToMarkdown = (node: Node): string => {
  if (node.nodeType === Node.TEXT_NODE) {
    return escapeMarkdown(normalizeInlineWhitespace(node.textContent || ''))
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return ''
  }

  const element = node as HTMLElement
  const tagName = element.tagName

  if (tagName === 'BR') {
    return '\n'
  }

  if (tagName === 'IMG') {
    const image = element as HTMLImageElement
    const src = image.getAttribute('src')
    if (src == null || src.trim() === '') {
      return ''
    }
    const alt = escapeMarkdown(image.getAttribute('alt') || '')
    const title = image.getAttribute('title')
    const titlePart =
      title != null && title.trim() !== ''
        ? ` "${escapeLinkTitle(title.trim())}"`
        : ''
    return `![${alt}](${src.trim()}${titlePart})`
  }

  const children = Array.from(element.childNodes)
    .map((child) => nodeToMarkdown(child))
    .join('')

  if (tagName === 'A') {
    const href = element.getAttribute('href')
    if (href == null || href.trim() === '') {
      return children
    }
    const label = children.trim() || href.trim()
    return `[${label}](${href.trim()})`
  }

  if (tagName === 'STRONG' || tagName === 'B') {
    const trimmed = children.trim()
    return trimmed.length > 0 ? `**${trimmed}**` : ''
  }

  if (tagName === 'EM' || tagName === 'I') {
    const trimmed = children.trim()
    return trimmed.length > 0 ? `_${trimmed}_` : ''
  }

  if (tagName === 'CODE') {
    return `\`${children.trim().replace(/`/g, '\\`')}\``
  }

  if (tagName === 'LI') {
    return listItem(children)
  }

  if (tagName === 'UL' || tagName === 'OL') {
    return joinBlock(children)
  }

  if (blockTags.has(tagName)) {
    return joinBlock(children)
  }

  return children
}

export const htmlContainsImage = (html: string) => {
  return /<img\b[^>]*\bsrc\s*=/i.test(html)
}

export const htmlToMarkdown = (html: string): string | null => {
  if (!htmlContainsImage(html)) {
    return null
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const markdown = Array.from(doc.body.childNodes)
    .map((node) => nodeToMarkdown(node))
    .join('')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return markdown.length > 0 ? markdown : null
}
