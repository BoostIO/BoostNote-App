import unified from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import remarkAdmonitions from 'remark-admonitions'
import remarkMath from 'remark-math'
import rehypeDocument from 'rehype-document'
import rehypeStringify from 'rehype-stringify'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import rehypeKatex from 'rehype-katex'
import { mergeDeepRight, prop } from 'ramda'
import gh from 'hast-util-sanitize/lib/github.json'
import { downloadString } from './download'
import rehypeCodeMirror from '../../design/lib/codemirror/rehypeCodeMirror'
import { SerializedDoc } from '../interfaces/db/doc'
import { filenamify } from './utils/string'
import { UserSettings } from './stores/settings'
import { boostHubBaseUrl } from './consts'
import { selectV2Theme } from '../../design/lib/styled/styleFunctions'
import { getGlobalCss } from '../../design/components/atoms/GlobalStyle'

export function filenamifyTitle(title: string): string {
  return filenamify(title.toLowerCase().replace(/\s+/g, '-'))
}

const remarkAdmonitionOptions = {
  tag: ':::',
  icons: 'emoji',
  infima: false,
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
    .use(remarkAdmonitions, remarkAdmonitionOptions)
    .use([remarkRehype, { allowDangerousHTML: false }])
    .use(rehypeCodeMirror, {
      ignoreMissing: true,
      theme: preferences['general.codeBlockTheme'],
    })
    .use(rehypeRaw)
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeDocument, {
      title: doc.title,
      style: previewStyle,
      css: getCssLinks(preferences),
      meta: { keywords: (doc.tags || []).map(prop('text')).join() },
    })
    .use(rehypeStringify)
    .use(rehypeKatex)
    .process(doc.head.content)

  downloadString(
    file.toString(),
    `${filenamifyTitle(doc.title)}.html`,
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
        `title: "${doc.title}"`,
        `tags: "${(doc.tags || []).map(prop('text')).join()}"`,
        '---',
        '',
        '',
      ].join('\n') + content
  }

  downloadString(content, `${filenamifyTitle(doc.title)}.md`, 'text/markdown')
}

const fetchCorrectMdThemeName = (theme: string, appTheme: string) => {
  if (theme === 'solarized-dark') {
    return 'solarized'
  }
  if (theme === 'default') {
    if (appTheme === 'light') {
      return null
    }
    return 'material-darker'
  }

  return theme
}

const getCssLinks = (settings: UserSettings) => {
  const cssHrefs: string[] = []

  cssHrefs.push(boostHubBaseUrl + '/app/katex/katex.min.css')
  cssHrefs.push(boostHubBaseUrl + '/app/remark-admonitions/classic.css')

  const editorTheme = fetchCorrectMdThemeName(
    settings['general.editorTheme'],
    settings['general.theme']
  )
  if (editorTheme != null) {
    const editorThemePath =
      boostHubBaseUrl + `/app/codemirror/theme/${editorTheme}.css`
    cssHrefs.push(editorThemePath)
  }

  const markdownCodeBlockTheme = fetchCorrectMdThemeName(
    settings['general.codeBlockTheme'],
    settings['general.theme']
  )
  if (
    markdownCodeBlockTheme != null &&
    markdownCodeBlockTheme !== editorTheme
  ) {
    cssHrefs.push(
      boostHubBaseUrl + `/app/codemirror/theme/${markdownCodeBlockTheme}.css`
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
  const themedGlobalCss = getGlobalCss(selectV2Theme(generalThemeName))
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
    .use(remarkAdmonitions, remarkAdmonitionOptions)
    .use(remarkMath)
    .use([remarkRehype, { allowDangerousHTML: true }])
    .use(rehypeRaw)
    .use(rehypeSanitize, schema)
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
