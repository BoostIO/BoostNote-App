import unified from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import remarkMath from 'remark-math'
import rehypeDocument from 'rehype-document'
import rehypeStringify from 'rehype-stringify'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import rehypeKatex from 'rehype-katex'
import { mergeDeepRight, prop } from 'ramda'
import gh from 'hast-util-sanitize/lib/github.json'
import { downloadString } from './download'
import rehypeCodeMirror from './rehypeCodeMirror'
import { SerializedDoc } from '../interfaces/db/doc'
import { filenamify } from './utils/string'
import { UserSettings } from './stores/settings/types'
import { getGlobalCss } from '../components/GlobalStyle'
import { selectTheme } from './styled'

export function filenamifyTitle(title: string): string {
  return filenamify(title.toLowerCase().replace(/\s+/g, '-'))
}

const sanitizeSchema = mergeDeepRight(gh, {
  attributes: { '*': ['className'] },
})

export const exportAsHtmlFile = async (
  doc: SerializedDoc,
  preferences: UserSettings,
  previewStyle?: string
): Promise<void> => {
  if (doc.head == null) {
    return
  }

  const file = await unified()
    .use(remarkParse)
    .use(remarkMath)
    .use([remarkRehype, { allowDangerousHTML: false }])
    .use(rehypeCodeMirror, {
      ignoreMissing: true,
      theme: preferences['general.codeBlockTheme'],
    })
    .use(rehypeRaw)
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeDocument, {
      title: doc.head.title,
      style: previewStyle,
      css: 'https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.css',
      meta: { keywords: (doc.tags || []).map(prop('text')).join() },
    })
    .use(rehypeStringify)
    .use(rehypeKatex)
    .process(doc.head.content)

  downloadString(
    file.toString(),
    `${filenamifyTitle(doc.head.title)}.html`,
    'text/html'
  )
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
        `title: "${doc.head!.title}"`,
        `tags: "${(doc.tags || []).map(prop('text')).join()}"`,
        '---',
        '',
        '',
      ].join('\n') + content
  }

  downloadString(
    content,
    `${filenamifyTitle(doc.head.title)}.md`,
    'text/markdown'
  )
}

const fetchCorrectMdThemeName = (theme: string) => {
  return theme === 'solarized-dark' ? 'solarized' : theme
}

const getCssLinks = (settings: UserSettings) => {
  const cssHrefs: string[] = []

  cssHrefs.push('https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.css')

  const markdownCodeBlockTheme = fetchCorrectMdThemeName(
    settings['general.codeBlockTheme']
  )
  const editorTheme = fetchCorrectMdThemeName(settings['general.editorTheme'])

  const editorThemePath =
    process.env.BASE_URL + `/static/codemirror/theme/${editorTheme}.css`

  cssHrefs.push(editorThemePath)
  if (markdownCodeBlockTheme !== editorTheme && markdownCodeBlockTheme) {
    cssHrefs.push(
      process.env.BASE_URL +
        `/static/codemirror/theme/${markdownCodeBlockTheme}.css`
    )
  }
  return cssHrefs
}

const cssStyleLinkGenerator = (href: string) =>
  `<link rel="stylesheet" href="${href}" type="text/css"/>`

const generatePrintToPdfHTML = (
  markdownHTML: string | Uint8Array,
  settings: UserSettings,
  previewStyle?: string
) => {
  const cssHrefs: string[] = getCssLinks(settings)
  const generalThemeName = settings['general.theme']
  const cssLinks = cssHrefs
    .map((href) => cssStyleLinkGenerator(href))
    .join('\n')
  const themedGlobalCss = getGlobalCss(selectTheme(generalThemeName))
  const previewStyleCssEl = previewStyle ? `` : ''

  return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
        <!-- Preview styles -->
        <style>${themedGlobalCss}</style>
        ${previewStyle != null ? `<style>${previewStyle}</style>` : ''}
        ${previewStyleCssEl}
        <!-- External Css files -->
        ${cssLinks}
        <!-- Print Styles -->
        <style media="print">
          pre code {
            white-space: pre-wrap;
          }
        </style>
      </head>
      <body>
        <div class="${generalThemeName}">
          ${markdownHTML}
        </div>
      </body>
    </html>
  `
}

const schema = mergeDeepRight(gh, {
  attributes: {
    '*': [...gh.attributes['*'], 'className', 'align'],
    input: [...gh.attributes.input, 'checked'],
    pre: ['dataRaw'],
  },
})

export async function convertMarkdownToPdfExportableHtml(
  content: string,
  preferences: UserSettings,
  previewStyle?: string
): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use([remarkRehype, { allowDangerousHTML: true }])
    .use(rehypeRaw)
    .use(rehypeSanitize, schema)
    .use(remarkMath)
    .use(rehypeCodeMirror, {
      ignoreMissing: true,
      theme: preferences['markdown.codeBlockTheme'],
    })
    .use(rehypeKatex, { output: 'htmlAndMathml' })
    .use(rehypeStringify)
    .process(content)

  const stringifiedMdContent = file.toString().trim() + '\n'

  const htmlString = generatePrintToPdfHTML(
    stringifiedMdContent,
    preferences,
    previewStyle
  )

  return htmlString
}
