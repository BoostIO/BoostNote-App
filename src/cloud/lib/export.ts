import { prop } from 'ramda'
import { downloadString } from './download'
import { SerializedDoc } from '../interfaces/db/doc'
import { filenamify } from './utils/string'

export function filenamifyTitle(title: string): string {
  return filenamify(title.toLowerCase().replace(/\s+/g, '-'))
}

export const exportAsMarkdownFile = async (
  doc: SerializedDoc,
  { includeFrontMatter }: { includeFrontMatter: boolean }
): Promise<void> => {
  if (doc.head == null) {
    return
  }

  let content = doc.head.content.trim() + '\n'
  if (includeFrontMatter) {
    content =
      [
        '---',
        `title: "${doc.title}"`,
        `tags: "${(doc.tags || []).map(prop('text')).join()}"`,
        '---',
        '',
        '',
      ].join('\n') + content
  }

  downloadString(content, `${filenamifyTitle(doc.title)}.md`, 'text/markdown')
}
