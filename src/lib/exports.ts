import unified from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import remarkMath from 'remark-math'
import rehypeDocument from 'rehype-document'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import rehypeKatex from 'rehype-katex'
import { mergeDeepRight } from 'ramda'
import gh from 'hast-util-sanitize/lib/github.json'
import { rehypeCodeMirror } from './../components/atoms/MarkdownPreviewer'
import { downloadBlob, downloadString } from './download'
import { NoteDoc } from './db/types'
import { Preferences } from './preferences'
import { filenamify } from './string'
import React from 'react'
import remarkEmoji from 'remark-emoji'
import rehypeReact from 'rehype-react'
import CodeFence from '../components/atoms/markdown/CodeFence'
import { getGlobalCss, selectTheme } from './styled/styleUtil'
import yaml from 'yaml'
import { convertHtmlStringToPdfBlob } from './electronOnly'

export function filenamifyNoteTitle(noteTitle: string): string {
  return filenamify(noteTitle.toLowerCase().replace(/\s+/g, '-'))
}

const getFrontMatter = (note: NoteDoc): string => {
  return [
    '---',
    yaml
      .stringify({
        title: note.title,
        tags: note.tags,
      })
      .trim(),
    '---',
    '',
  ].join('\n')
}

const sanitizeSchema = mergeDeepRight(gh, {
  attributes: { '*': ['className'] },
})

export const exportNoteAsHtmlFile = async (
  note: NoteDoc,
  preferences: Preferences,
  pushMessage: (context: any) => any,
  previewStyle?: string
): Promise<void> => {
  await unified()
    .use(remarkParse)
    .use(remarkMath)
    .use([remarkRehype, { allowDangerousHTML: false }])
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
        pushMessage({
          title: 'Note processing failed',
          description: 'Please check markdown syntax and try again later.',
        })
        return
      }

      downloadString(
        file.toString(),
        `${filenamifyNoteTitle(note.title)}.html`,
        'text/html'
      )
      return
    })
}

export const exportNoteAsMarkdownFile = async (
  note: NoteDoc,
  { includeFrontMatter }: { includeFrontMatter: boolean }
): Promise<void> => {
  let content = note.content.trim() + '\n'
  if (includeFrontMatter) {
    content = getFrontMatter(note) + '\n' + content
  }
  downloadString(
    content,
    `${filenamifyNoteTitle(note.title)}.md`,
    'text/markdown'
  )
  return
}

const schema = mergeDeepRight(gh, {
  attributes: {
    '*': [...gh.attributes['*'], 'className', 'align'],
    input: [...gh.attributes.input, 'checked'],
    pre: ['dataRaw'],
  },
})

const fetchCorrectMdThemeName = (theme: string) => {
  return theme === 'solarized-dark' ? 'solarized' : theme
}

const getCssLinks = (preferences: Preferences) => {
  const cssHrefs: string[] = []
  const app = window.require('electron').remote.app
  const isProd = app.isPackaged
  const pathPrefix = 'file://' + app.getAppPath()
  const parentPathTheme =
    pathPrefix + (isProd === true ? '/compiled/app' : '/../node_modules')
  const editorTheme = fetchCorrectMdThemeName(preferences['editor.theme'])
  const markdownCodeBlockTheme = fetchCorrectMdThemeName(
    preferences['markdown.codeBlockTheme']
  )

  const editorThemePath = `${parentPathTheme}/codemirror/theme/${editorTheme}.css`
  cssHrefs.push(editorThemePath)
  if (editorTheme !== markdownCodeBlockTheme) {
    if (markdownCodeBlockTheme) {
      const markdownCodeBlockThemePath = `${parentPathTheme}/codemirror/theme/${markdownCodeBlockTheme}.css`
      cssHrefs.push(markdownCodeBlockThemePath)
    }
  }
  return cssHrefs
}

const cssStyleLinkGenerator = (href: string) =>
  `<link rel="stylesheet" href="${href}" type="text/css"/>`

const getPrintStyle = () => `
  <style media="print">
    pre code {
      white-space: pre-wrap;
    }
  </style>
`

const generatePrintToPdfHTML = (
  markdownHTML: string | Uint8Array,
  preferences: Preferences,
  previewStyle?: string
) => {
  const cssHrefs: string[] = getCssLinks(preferences)
  const generalThemeName = preferences['general.theme']
  const cssLinks = cssHrefs
    .map((href) => cssStyleLinkGenerator(href))
    .join('\n')
  const appThemeCss = getGlobalCss(selectTheme(generalThemeName))
  const previewStyleCssEl = previewStyle ? `<style>${previewStyle}</style>` : ''
  const appThemeCssEl = appThemeCss ? `<style>${appThemeCss}</style>` : ''

  return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
        <!-- Preview styles -->
        ${appThemeCssEl}
        ${previewStyleCssEl}

        <!-- Link tag styles -->
        ${cssStyleLinkGenerator(
          'https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.css'
        )}
        ${cssLinks}

        <!-- Print Styles -->
        ${getPrintStyle()}
      </head>
      <body>
        <div class="${generalThemeName}">
          ${markdownHTML}
        </div>
      </body>
    </html>
  `
}

export const exportNoteAsPdfFile = async (
  note: NoteDoc,
  preferences: Preferences,
  pushMessage: (context: any) => any,
  previewStyle?: string
): Promise<void> => {
  try {
    const output = await unified()
      .use(remarkParse)
      .use(remarkEmoji, { emoticon: false })
      .use([remarkRehype, { allowDangerousHTML: true }])
      .use(rehypeRaw)
      .use(rehypeSanitize, schema)
      .use(remarkMath)
      .use(rehypeCodeMirror, {
        ignoreMissing: true,
        theme: preferences['markdown.codeBlockTheme'],
      })
      .use(rehypeKatex, { output: 'htmlAndMathml' })
      .use(rehypeReact, {
        createElement: React.createElement,
        components: {
          pre: CodeFence,
        },
      })
      .use(rehypeStringify)
      .process(note.content)
    const markdownContent = output.toString('utf-8').trim() + '\n'
    const htmlString = generatePrintToPdfHTML(
      markdownContent,
      preferences,
      previewStyle
    )

    // Enable when newer version of electron is available
    // const tagsStr =
    //   note.tags.length > 0 ? `, tags: [${note.tags.join(' ')}]` : ''
    // const headerFooter: Record<string, string> = {
    //   title: `${note.title}${tagsStr}`,
    //   url: `file://${filenamifyNoteTitle(note.title)}.pdf`,
    // }
    const printOpts = {
      // Needed for codemirorr themes (backgrounds)
      printBackground: true,
      // Enable margins if header footer is printed
      // No margins 1, default margins 0, 2 - minimum margins
      // marginsType: includeFrontMatter ? 0 : 1,
      pageSize: 'A4', // This could be chosen by user,
      // headerFooter: includeFrontMatter ? headerFooter : undefined,
    }
    const pdfBlob = await convertHtmlStringToPdfBlob(htmlString, printOpts)
    const pdfName = `${filenamifyNoteTitle(note.title)}.pdf`
    downloadBlob(pdfBlob, pdfName)
  } catch (error) {
    console.warn(error)
    pushMessage({
      title: 'PDF export failed',
      description: error.message,
    })
  }
}
