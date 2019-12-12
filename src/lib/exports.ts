import unified from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import remarkStringify from 'remark-stringify'
import rehypeDocument from 'rehype-document'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import { mergeDeepRight } from 'ramda'
import gh from 'hast-util-sanitize/lib/github.json'
import { rehypeCodeMirror } from './../components/atoms/MarkdownPreviewer'
import { downloadString } from './download'
import { NoteDoc } from './db/types'
import { Preferences } from './preferences'

const sanitizeSchema = mergeDeepRight(gh, {
  attributes: { '*': ['className'] }
})

export const exportNoteAsHtmlFile = async (
  note: NoteDoc,
  preferences: Preferences,
  previewStyle?: string
): Promise<void> => {
  await unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHTML: false })
    .use(rehypeCodeMirror, {
      ignoreMissing: true,
      theme: preferences['markdown.codeBlockTheme']
    })
    .use(rehypeRaw)
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeDocument, {
      title: note.title,
      style: previewStyle,
      meta: { keywords: note.tags.join() }
    })
    .use(rehypeStringify)
    .process(note.content, (err, file) => {
      if (err != null) {
        /* TODO: Toast error */
        console.error(err)
        return
      }

      downloadString(
        file.toString(),
        `${note.title.toLowerCase().replace(/\s+/g, '-')}.html`,
        'text/html'
      )
      return
    })
}

export const exportNoteAsMarkdownFile = async (
  note: NoteDoc
): Promise<void> => {
  await unified()
    .use(remarkParse)
    .use(remarkStringify)
    .process(note.content, (err, file) => {
      if (err != null) {
        /* TODO: Toast error */
        console.error(err)
        return
      }
      downloadString(
        [
          '---',
          `title: "${note.title}"`,
          `tags: "${note.tags.join()}"`,
          '---',
          file.toString()
        ].join('\n'),
        `${note.title.toLowerCase().replace(/\s+/g, '-')}.md`,
        'text/markdown'
      )
      return
    })
  return
}
