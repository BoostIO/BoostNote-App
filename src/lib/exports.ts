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
import { rehypeCodeMirror } from '../components/atoms/MarkdownPreviewer'
import { downloadBlob, downloadString } from './download'
import { AttachmentData, NoteDoc } from './db/types'
import { Preferences } from './preferences'
import { filenamify } from './string'
import React from 'react'
import remarkEmoji from 'remark-emoji'
import rehypeReact from 'rehype-react'
import CodeFence from '../components/atoms/markdown/CodeFence'
import { getGlobalCss, selectTheme } from './styled/styleUtil'
import yaml from 'yaml'
import { convertHtmlStringToPdfBuffer } from './electronOnly'

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

export async function convertNoteDocToHtmlString(
  note: NoteDoc,
  preferences: Preferences,
  pushMessage: (context: any) => any,
  getAttachmentData: (src: string) => Promise<undefined | AttachmentData>,
  previewStyle?: string
) {
  const file = await unified()
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
    .process(note.content)

  const [htmlString, attachmentUrls] = await updateNoteLinks(
    file.toString(),
    pushMessage,
    getAttachmentData,
    true
  )
  if (attachmentUrls.length != 0) {
    console.info('HTML export tried to export blobs as object URLs')
  }
  return htmlString
}

export const exportNoteAsHtmlFile = async (
  note: NoteDoc,
  preferences: Preferences,
  pushMessage: (context: any) => any,
  getAttachmentData: (src: string) => Promise<undefined | AttachmentData>,
  previewStyle?: string
): Promise<void> => {
  try {
    const htmlString = await convertNoteDocToHtmlString(
      note,
      preferences,
      pushMessage,
      getAttachmentData,
      previewStyle
    )
    downloadString(htmlString, `${filenamify(note.title)}.html`, 'text/html')
  } catch (error) {
    pushMessage({
      title: 'Note processing failed',
      description: 'Please check markdown syntax and try again later.',
    })
  }
}

export function convertNoteDocToMarkdownString(
  note: NoteDoc,
  includeFrontMatter: boolean
) {
  let content = note.content.trim() + '\n'
  if (includeFrontMatter) {
    content = getFrontMatter(note) + '\n' + content
  }
  return content
}

export const exportNoteAsMarkdownFile = async (
  note: NoteDoc,
  includeFrontMatter: boolean
): Promise<void> => {
  const content = convertNoteDocToMarkdownString(note, includeFrontMatter)
  downloadString(content, `${filenamify(note.title)}.md`, 'text/markdown')
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

interface ImageData {
  name: string
  src?: string
  blob?: Blob
}

const generatePrintToPdfHTML = (
  markdownHTML: string,
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

async function convertBlobToBase64(blob: Blob) {
  const reader = new FileReader()
  reader.readAsDataURL(blob)
  return new Promise<string | ArrayBuffer | null>((resolve) => {
    reader.onloadend = () => {
      resolve(reader.result)
    }
  })
}

async function updateNoteLinks(
  content: string,
  pushMessage: (context: any) => any,
  getAttachmentData: (src: string) => Promise<undefined | AttachmentData>,
  htmlExport = false
): Promise<[string, string[]]> {
  // How name is stored:
  //  const fileName = `${dashify(name)}-${getHexatrigesimalString(time++)
  // todo: [komediruzecki-11/12/2020] Is regex correct,
  //   can we improve it, do we support other file types/attachments?
  const attachmentGroups = [
    ...content.matchAll(/src="([0-9a-zA-Z-]*-[0-9a-zA-Z]{8,14}\.png)"/g),
  ]

  const attachmentMatches = [
    ...new Set(
      attachmentGroups
        .filter((group) => group.length > 0)
        .map((group) => group[1])
    ),
  ]

  let contentWithValidImgSrc = content
  const attachmentErrors: string[] = []
  const attachmentUrls: string[] = []
  for (const attachment of attachmentMatches) {
    const imageData: ImageData | undefined = await getAttachmentData(attachment)
      .then((value) => {
        if (!value) {
          return
        }
        switch (value.type) {
          case 'blob':
            return { name: attachment, blob: value.blob }
          case 'src':
            return { name: attachment, src: value.src }
        }
      })
      .catch((error) => {
        console.log(
          `Error during loading attachment ${attachment}, reason: ${
            error ? error.message : 'Unknown'
          }`
        )
        return undefined
      })

    if (imageData) {
      let srcUrl = ''
      if (imageData.src) {
        srcUrl = imageData.src
      } else if (imageData.blob) {
        if (htmlExport) {
          // Set url as base64 encoded image
          const base64EncodedImage = await convertBlobToBase64(imageData.blob)
          if (base64EncodedImage !== null) {
            srcUrl = base64EncodedImage.toString()
          }
        } else {
          srcUrl = window.URL.createObjectURL(imageData.blob)
          // save attachment url for revoking
          attachmentUrls.push(srcUrl)
        }
      }

      if (srcUrl) {
        contentWithValidImgSrc = contentWithValidImgSrc.replace(
          new RegExp(imageData.name, 'g'),
          srcUrl
        )
      }
    } else {
      attachmentErrors.push(attachment)
    }
  }

  if (attachmentErrors.length > 0) {
    pushMessage({
      title: `PDF export cannot find attachment data for attachments.`,
      description: `Cannot find attachments: [${attachmentErrors.join(
        ', '
      )}],\nPlease check is such exists to properly export the PDF with attachments.`,
    })
  }
  return [contentWithValidImgSrc, attachmentUrls]
}

function revokeAttachmentsUrls(attachmentsUrls: string[]) {
  attachmentsUrls.forEach((attachmentUrl) => {
    window.URL.revokeObjectURL(attachmentUrl)
  })
}

export async function convertNoteDocToPdfBuffer(
  note: NoteDoc,
  preferences: Preferences,
  pushMessage: (context: any) => any,
  getAttachmentData: (src: string) => Promise<undefined | AttachmentData>,
  previewStyle?: string
): Promise<Buffer> {
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
  const [mdContentWithValidLinks, attachmentUrls] = await updateNoteLinks(
    markdownContent,
    pushMessage,
    getAttachmentData
  )

  try {
    const htmlString = generatePrintToPdfHTML(
      mdContentWithValidLinks,
      preferences,
      previewStyle
    )

    // Enable if we want tags inside PDF export
    // const tagsStr =
    //   note.tags.length > 0 ? `, tags: [${note.tags.join(' ')}]` : ''
    // const headerFooter: Record<string, string> = {
    //   title: `${note.title}${tagsStr}`,
    //   url: `file://${filenamify(note.title)}.pdf`,
    // }
    const printOpts = {
      // Needed for codemirorr themes (backgrounds)
      printBackground: true,
      // Enable margins if header and footer is printed!
      // No margins 1, default margins 0, 2 - minimum margins
      marginsType: 0, // This could be chosen by user.
      pageSize: 'A4', // This could be chosen by user.
      // headerFooter: headerFooter,
    }
    return await convertHtmlStringToPdfBuffer(htmlString, printOpts)
  } finally {
    revokeAttachmentsUrls(attachmentUrls)
  }
}

export const exportNoteAsPdfFile = async (
  note: NoteDoc,
  preferences: Preferences,
  pushMessage: (context: any) => any,
  getAttachmentData: (src: string) => Promise<undefined | AttachmentData>,
  previewStyle?: string
): Promise<void> => {
  try {
    const pdfBuffer = await convertNoteDocToPdfBuffer(
      note,
      preferences,
      pushMessage,
      getAttachmentData,
      previewStyle
    )
    const pdfName = `${filenamify(note.title)}.pdf`

    downloadBlob(new Blob([pdfBuffer]), pdfName)
  } catch (error) {
    console.warn(error)
    pushMessage({
      title: 'PDF export failed',
      description: error.message,
    })
  }
}
