import unified from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import remarkStringify from 'remark-stringify'
import remarkMath from 'remark-math'
import rehypeDocument from 'rehype-document'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import rehypeKatex from 'rehype-katex'
import { mergeDeepRight } from 'ramda'
import gh from 'hast-util-sanitize/lib/github.json'
import { rehypeCodeMirror } from './../components/atoms/MarkdownPreviewer'
import { downloadString, downloadBlob } from './download'
import { NoteDoc } from './db/types'
import { Preferences } from './preferences'
import jsPDF from 'jspdf'

const sanitizeSchema = mergeDeepRight(gh, {
  attributes: { '*': ['className'] },
})

export const exportNoteAsPdfFile = async (
  note: NoteDoc,
  preferences: Preferences,
  previewStyle?: string
): Promise<void> => {
  await unified()
    .use(remarkParse)
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHTML: false })
    .use(rehypeCodeMirror, {
      ignoreMissing: true,
      theme: preferences['markdown.codeBlockTheme'],
    })
    .use(rehypeRaw)
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeDocument, {
      title: note.title,
      style: previewStyle,
      css: 'https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.css',
      meta: { keywords: note.tags.join() },
    })
    .use(rehypeStringify)
    .use(rehypeKatex)
    .process(note.content, (err, file) => {
      if (err != null) {
        /* TODO: Toast error */
        console.error(err)
        return
      }

      var jsPDFdocument = new jsPDF();

      jsPDFdocument.fromHTML(file.toString(), 0,0);
      
      downloadBlob(
        jsPDFdocument.output('blob'),
        `${note.title.toLowerCase().replace(/\s+/g, '-')}.pdf`
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
          file.toString(),
        ].join('\n'),
        `${note.title.toLowerCase().replace(/\s+/g, '-')}.md`,
        'text/markdown'
      )
      return
    })
  return
}

export const exportNoteAsHtmlFile = async (
  note: NoteDoc,
  preferences: Preferences,
  previewStyle?: string
): Promise<void> => {
  await unified()
    .use(remarkParse)
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHTML: false })
    .use(rehypeCodeMirror, {
      ignoreMissing: true,
      theme: preferences['markdown.codeBlockTheme'],
    })
    .use(rehypeRaw)
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeDocument, {
      title: note.title,
      style: previewStyle,
      css: 'https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.css',
      meta: { keywords: note.tags.join() },
    })
    .use(rehypeStringify)
    .use(rehypeKatex)
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