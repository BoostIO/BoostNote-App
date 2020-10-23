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
import { downloadBlob, downloadString } from './download'
import { NoteDoc } from './db/types'
import { Preferences } from './preferences'
import { filenamify } from './string'
import React from 'react'
import remarkEmoji from 'remark-emoji'
import rehypeReact from 'rehype-react'
import CodeFence from '../components/atoms/markdown/CodeFence'
import {getGlobalCss, selectTheme } from './styled/styleUtil'

const sanitizeNoteName = function (rawNoteName: string): string {
  return filenamify(rawNoteName.toLowerCase().replace(/\s+/g, '-'))
}

const sanitizeSchema = mergeDeepRight(gh, {
  attributes: { '*': ['className'] },
})

export const exportNoteAsHtmlFile = async (
  note: NoteDoc,
  preferences: Preferences,
  pushMessage: (context: any) => any,
  previewStyle?: string,
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
        `${sanitizeNoteName(note.title)}.html`,
        'text/html'
      )
      return
    })
}

export const exportNoteAsMarkdownFile = async (
  note: NoteDoc,
  pushMessage: (context: any) => any,
  { includeFrontMatter }: { includeFrontMatter: boolean }
): Promise<void> => {
  await unified()
    .use(remarkParse)
    .use(remarkStringify)
    .process(note.content, (err, file) => {
      if (err != null) {
        pushMessage({
          title: 'Note processing failed',
          description: 'Please check markdown syntax and try again later.',
        })
        return
      }
      let content = file.toString().trim() + '\n'
      if (includeFrontMatter) {
        content =
          [
            '---',
            `title: "${note.title}"`,
            `tags: "${note.tags.join()}"`,
            '---',
            '',
            '',
          ].join('\n') + content
      }

      downloadString(
        content,
        `${sanitizeNoteName(note.title)}.md`,
        'text/markdown'
      )
      return
    })
  return
}

const schema = mergeDeepRight(gh, {
  attributes: {
    '*': [...gh.attributes['*'], 'className', 'align'],
    input: [...gh.attributes.input, 'checked'],
    pre: ['dataRaw'],
  },
})

const getCssLinks = (preferences : Preferences) => {
  let cssHrefs : string[] = []
  const app = window.require('electron').remote.app;
  const isProd = app.isPackaged
  const parentPathTheme = app.getAppPath() + ((isProd === true) ? "/compiled/app" : "/../node_modules")
  let editorTheme = preferences['editor.theme']
  let markdownCodeBlockTheme = preferences['markdown.codeBlockTheme']
  if (editorTheme === 'solarized-dark') {
    editorTheme = 'solarized'
  }
  const editorThemePath = `${parentPathTheme}/codemirror/theme/${editorTheme}.css`
  cssHrefs.push(editorThemePath)
  if (editorTheme !== markdownCodeBlockTheme) {
    if (markdownCodeBlockTheme) {
      if (markdownCodeBlockTheme === 'solarized-dark') {
        markdownCodeBlockTheme = 'solarized'
      }
      const markdownCodeBlockThemePath = `${parentPathTheme}/codemirror/theme/${markdownCodeBlockTheme}.css`
      cssHrefs.push(markdownCodeBlockThemePath)
    }
  }
  return cssHrefs
}

export const exportNoteAsPdfFile = async (
  note: NoteDoc,
  preferences: Preferences,
  pushMessage: (context: any) => any,
  previewStyle?: string,
): Promise<void> => {
  await unified()
    .use(remarkParse)
    .use(remarkStringify)
    .process(note.content, (err, file) => {
      if (err != null) {
        pushMessage({
          title: 'Note processing failed',
          description: 'Please check markdown syntax and try again later.',
        })
      }
      let content = file.toString().trim() + '\n'
      const markdownProcessor = unified()
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
        .use(rehypeKatex)
        .use(rehypeReact, {
          createElement: React.createElement,
          components: {
            pre: CodeFence,
          },
        })
        .use(rehypeStringify)

      // Process note-markdown content into react string
      let resultObj = markdownProcessor.processSync(content)

      // Create new window (hidden)
      const { BrowserWindow } = window.require('electron').remote
      const app = window.require('electron').remote.app;
      const ipcMain = window.require('electron').remote.ipcMain;
      const isProd = app.isPackaged === true
      const parentPathHTML = app.getAppPath() + ((isProd === true) ? "/compiled/app/static" : "/../static")
      const windowOptions = {
        webPreferences: { nodeIntegration: true, webSecurity: false },
        show: false
      }
      const win = new BrowserWindow(windowOptions)

      // Load HTML for rendering react string for markdown content created earlier
      win.loadFile(`${parentPathHTML}/render_md_to_pdf.html`)
      win.webContents.on('did-finish-load', function () {
        // Fetch needed CSS styles
        const generalThemeName = preferences['general.theme']
        const appThemeCss = getGlobalCss(selectTheme(generalThemeName))
        let cssHrefs: string[] = getCssLinks(preferences)
        if (previewStyle) {
          win.webContents.insertCSS(previewStyle)
          win.webContents.insertCSS(appThemeCss)
        }
        // Do not show the window while exporting (for debugging purposes only)
        // win.show()
        setTimeout(() => {
          // Send message to window to render the markdown content with the applied css and theme class
          win.webContents.send('render-markdown-to-pdf', resultObj.contents, cssHrefs, generalThemeName)
        }, 500)
      })

      // When PDF rendered, notify me (doing this only once removes it for further messages)
      // this way no need to remove it manually after receving the message
      // another click on PDF export would once again bind the current note markdown to HTML rendered page
      ipcMain.once('pdf-notify-export-data', (_: object, data: string, error: any) => {
        if (data && !error) {
          // We got the PDF offer user to save it
          const pdfName = `${sanitizeNoteName(note.title)}.pdf`
          const pdfBlob = new Blob([data], {
            type: "application/pdf" // application/octet-stream
          })
          downloadBlob(pdfBlob, pdfName)
        } else {
          pushMessage({
            title: 'PDF export failed',
            description: 'Please try again later.' + " Error: " + JSON.stringify(error),
          })
        }
        // Close window (it's hidden anyway, but dispose it)
        win.close()
      })
      return
    })
  return
}
