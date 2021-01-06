import unified from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import remarkMath from 'remark-math'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import rehypeKatex from 'rehype-katex'
import remarkAdmonitions from 'remark-admonitions'
import { mergeDeepRight } from 'ramda'
import gh from 'hast-util-sanitize/lib/github.json'
import { rehypeCodeMirror } from '../components/atoms/MarkdownPreviewer'
import { downloadBlob } from './download'
import { Attachment, NoteDoc, ObjectMap } from './db/types'
import { filenamify } from './string'
import React from 'react'
import remarkEmoji from 'remark-emoji'
import rehypeReact from 'rehype-react'
import CodeFence from '../components/atoms/markdown/CodeFence'
import { getGlobalCss, selectTheme } from './styled/styleUtil'
import yaml from 'yaml'
import {
  convertHtmlStringToPdfBuffer,
  getPathByName,
  mkdir,
  readFile,
  showOpenDialog,
  writeFile,
  readdir,
} from './electronOnly'
import { join } from 'path'
import { dev } from '../electron/consts'
import { excludeFileProtocol } from './db/utils'

interface ImageData {
  name: string
  src?: string
  blob?: Blob
}

interface CssStyleInfo {
  filename: string
  content: string | Buffer
  cssLink?: string
}

const schema = mergeDeepRight(gh, {
  attributes: {
    '*': [...gh.attributes['*'], 'className', 'align'],
    input: [...gh.attributes.input, 'checked'],
    pre: ['dataRaw'],
  },
})

export async function openDialog(): Promise<string> {
  const result = await showOpenDialog({
    properties: ['openDirectory', 'createDirectory'],
    buttonLabel: 'Select Folder',
    defaultPath: getPathByName('home'),
  })
  if (result.canceled) {
    return ''
  }
  if (result.filePaths == null) {
    return ''
  }

  return result.filePaths[0]
}

async function exportNoteAssets(
  assetsFolderPathname: string,
  cssStyles: CssStyleInfo[],
  attachmentFilenames: string[],
  attachmentMap: ObjectMap<Attachment>
): Promise<string[]> {
  const attachmentsFolderPathname = join(assetsFolderPathname, 'attachments')
  if (attachmentFilenames.length > 0) {
    await mkdir(assetsFolderPathname)
    await mkdir(attachmentsFolderPathname)
  }
  if (cssStyles.length > 0 && attachmentFilenames.length == 0) {
    await mkdir(assetsFolderPathname)
  }

  for (const cssStyle of cssStyles) {
    await writeFile(
      join(assetsFolderPathname, cssStyle.filename),
      cssStyle.content
    )
  }

  const exportedAttachmentKeys: string[] = []
  for (const attachmentFileName of attachmentFilenames) {
    try {
      const attachment = attachmentMap[attachmentFileName]
      if (!attachment) {
        continue
      }

      const data = await attachment.getData()
      if (!data) {
        continue
      }
      if (data.type === 'src') {
        const attachmentData = await readFile(excludeFileProtocol(data.src))
        await writeFile(
          join(attachmentsFolderPathname, attachmentFileName),
          attachmentData
        )
      } else {
        await writeFile(
          join(attachmentsFolderPathname, attachmentFileName),
          Buffer.from(await data.blob.arrayBuffer())
        )
      }

      exportedAttachmentKeys.push(attachmentFileName)
    } catch (err) {
      console.warn('No attachment found for name: ' + attachmentFileName)
      console.warn(err)
    }
  }
  return exportedAttachmentKeys
}

async function writeKatexFonts(assetsFolder: string) {
  const cssLinkRoot = getCssLinkCommonPath(false)
  const katexFontsPath = dev
    ? `${cssLinkRoot}/katex/dist/fonts`
    : `${cssLinkRoot}/katex/fonts/`

  try {
    const fontsFilenames = await readdir(katexFontsPath)
    if (fontsFilenames.length > 0) {
      await mkdir(`${assetsFolder}/fonts/`)
      for (const fontFilename of fontsFilenames) {
        const fontContents = await readFile(`${katexFontsPath}/${fontFilename}`)
        await writeFile(`${assetsFolder}/fonts/${fontFilename}`, fontContents)
      }
    }
  } catch (error) {
    console.warn(`Cannot find asset: ${katexFontsPath}`)
    console.warn(error)
  }
}

function getFrontMatter(note: NoteDoc): string {
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

function cssStyleLinkGenerator(href: string) {
  return `<link rel="stylesheet" href="${href}" type="text/css"/>`
}

function cssStyleTagGenerator(content: string) {
  return `<style type="text/css">${content}</style>`
}

function getPrintStyleForExports() {
  return `<style media="print">
pre code {
  white-space: pre-wrap;
}
</style>
`
}

function getCssLinkCommonPath(prependFilePrefix = false) {
  const pathPrefix = (prependFilePrefix ? 'file://' : '') + getPathByName('app')
  return pathPrefix + (dev ? '/../node_modules' : '/compiled/app')
}

async function getExportStylesInfo(
  codeBlockTheme: string,
  generalThemeName: string,
  previewStyle?: string
) {
  const cssStyles: CssStyleInfo[] = []
  const cssLinkRoot = getCssLinkCommonPath(true)
  const cssFileRoot = getCssLinkCommonPath(false)
  const markdownCodeBlockTheme =
    codeBlockTheme === 'solarized-dark' ? 'solarized' : codeBlockTheme
  const appThemeCss = getGlobalCss(selectTheme(generalThemeName))

  if (appThemeCss) {
    cssStyles.push({ filename: 'globalTheme.css', content: appThemeCss })
  }
  if (previewStyle) {
    cssStyles.push({ filename: 'previewStyle.css', content: previewStyle })
  }

  const remarkAdmonitionsPathSuffix = dev
    ? `remark-admonitions/styles/classic.css`
    : `remark-admonitions/classic.css`
  try {
    const remarkAdmonitionsStyle = await readFile(
      join(cssFileRoot, remarkAdmonitionsPathSuffix)
    )
    cssStyles.push({
      filename: 'remarkAdmonitions.css',
      content: remarkAdmonitionsStyle,
      cssLink: join(cssLinkRoot, remarkAdmonitionsPathSuffix),
    })
  } catch (err) {
    console.warn(
      `Cannot find asset: ${join(cssFileRoot, remarkAdmonitionsPathSuffix)}`
    )
  }

  if (markdownCodeBlockTheme) {
    const markdownCodeBlockThemePathSuffix = `codemirror/theme/${markdownCodeBlockTheme}.css`
    try {
      const markdownCodeBlockStyle = await readFile(
        join(cssFileRoot, markdownCodeBlockThemePathSuffix)
      )
      cssStyles.push({
        filename: `${markdownCodeBlockTheme}.css`,
        content: markdownCodeBlockStyle,
        cssLink: join(cssLinkRoot, markdownCodeBlockThemePathSuffix),
      })
    } catch (err) {
      console.warn(
        `Cannot find asset: ${join(
          cssFileRoot,
          markdownCodeBlockThemePathSuffix
        )}`
      )
    }
  }

  const katexPathSuffix = dev
    ? 'katex/dist/katex.min.css'
    : 'katex/katex.min.css'
  try {
    const katexStyle = await readFile(join(cssFileRoot, katexPathSuffix))
    cssStyles.push({
      filename: `katex.min.css`,
      content: katexStyle,
      cssLink: join(cssLinkRoot, katexPathSuffix),
    })
  } catch (err) {
    console.warn(`Cannot find asset: ${join(cssFileRoot, katexPathSuffix)}`)
  }

  return cssStyles
}

function generateHtmlMetadataFromNote(noteDoc: NoteDoc) {
  return `<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
<meta name="keywords" content="${noteDoc.tags.join(', ')}"/>
<title>${noteDoc.title}</title>
`
}

function generateCssForHtml(
  cssStyles: CssStyleInfo[],
  exportedNoteName: string
) {
  return `
${cssStyles
  .map((cssStyle) =>
    cssStyleLinkGenerator(`./${exportedNoteName}_assets/${cssStyle.filename}`)
  )
  .join('\n')}

<!-- Print Styles -->
${getPrintStyleForExports()}
`
}

async function generateCssForPrintToPdf(
  codeBlockTheme: string,
  generalThemeName: string,
  previewStyle?: string
) {
  const cssStyleInfos: CssStyleInfo[] = await getExportStylesInfo(
    codeBlockTheme,
    generalThemeName,
    previewStyle
  )
  const cssStyles = cssStyleInfos
    .map((cssStyleInfo) => {
      if (cssStyleInfo.cssLink) {
        return cssStyleLinkGenerator(cssStyleInfo.cssLink)
      } else {
        const content = cssStyleInfo.content.toString('utf-8').trim() + '\n'
        return cssStyleTagGenerator(content)
      }
    })
    .join('\n')

  return `
    ${cssStyles}

    <!-- Print Styles -->
    ${getPrintStyleForExports()}
  `
}

function wrapContentInThemeHtml(content: string, generalThemeName: string) {
  return `
<div class="${generalThemeName}">
  ${content}
</div>`
}

function combineHtmlElementsIntoHtmlDocumentString(
  bodyContent: string,
  css?: string,
  htmlMeta?: string
) {
  return `<!doctype html>
<html lang="en">
<head>
${htmlMeta ? htmlMeta : ''}
${css ? css : ''}
</head>
<body>
  ${bodyContent}
</body>
</html>
`
}

function extractAttachmentsFromString(
  content: string,
  regex = /src="([0-9a-zA-Z-]*-[0-9a-zA-Z]{8,14}\.png)"/g
) {
  const attachmentGroups = [...content.matchAll(regex)]

  return [
    ...new Set(
      attachmentGroups
        .filter((group) => group.length > 0)
        .map((group) => group[1])
    ),
  ]
}

async function updateAttachmentLinksToObjectUrls(
  content: string,
  pushMessage: (context: any) => any,
  attachmentMap: ObjectMap<Attachment>
): Promise<[string, string[]]> {
  const attachmentMatches = extractAttachmentsFromString(content)

  let contentWithValidImageSource = content
  const attachmentErrors: string[] = []
  const attachmentUrls: string[] = []
  for (const attachmentKey of attachmentMatches) {
    const attachment = attachmentMap[attachmentKey]
    if (!attachment) {
      attachmentErrors.push(attachmentKey)
      continue
    }

    const attachmentData = await attachment.getData()
    if (!attachmentData) {
      attachmentErrors.push(attachmentKey)
      continue
    }
    const imageData: ImageData =
      attachmentData.type === 'blob'
        ? { name: attachmentKey, blob: attachmentData.blob }
        : { name: attachmentKey, src: attachmentData.src }

    const imageLinkPattern = `src="${imageData.name}"`

    let srcUrl = ''
    if (imageData.src) {
      srcUrl = imageData.src
    } else if (imageData.blob) {
      srcUrl = window.URL.createObjectURL(imageData.blob)
      attachmentUrls.push(srcUrl)
    }
    if (srcUrl) {
      contentWithValidImageSource = contentWithValidImageSource.replace(
        new RegExp(imageLinkPattern, 'g'),
        `src="${srcUrl}"`
      )
    }
  }

  if (attachmentErrors.length > 0) {
    pushMessage({
      title: 'PDF export cannot find attachment data for attachments.',
      description: `Cannot find attachments: [${attachmentErrors.join(
        ', '
      )}],\nPlease check if attachments exists to properly export the PDF with attachments.`,
    })
  }
  return [contentWithValidImageSource, attachmentUrls]
}

function revokeAttachmentsUrls(attachmentUrls: string[]) {
  attachmentUrls.forEach((attachmentUrl) => {
    window.URL.revokeObjectURL(attachmentUrl)
  })
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

async function convertNoteDocToMarkdownHtmlString(
  note: NoteDoc,
  codeBlockTheme: string
): Promise<string> {
  const remarkAdmonitionOptions = {
    tag: ':::',
    icons: 'emoji',
    infima: false,
  }

  const output = await unified()
    .use(remarkParse)
    .use(remarkEmoji, { emoticon: false })
    .use(remarkAdmonitions, remarkAdmonitionOptions)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSanitize, schema)
    .use(remarkMath)
    .use(rehypeCodeMirror, {
      ignoreMissing: true,
      theme: codeBlockTheme,
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

  return output.toString('utf-8').trim() + '\n'
}

export const exportNoteAsMarkdownFile = async (
  saveFolderPathname: string,
  saveFilename: string,
  note: NoteDoc,
  attachmentMap: ObjectMap<Attachment>,
  includeFrontMatter: boolean
): Promise<void> => {
  const exportedNoteName = `${filenamify(saveFilename)}`
  const exportedNoteFilename = `${exportedNoteName}.md`
  const saveLocation = join(saveFolderPathname, exportedNoteFilename)
  const content = convertNoteDocToMarkdownString(note, includeFrontMatter)
  const attachmentFilenames = extractAttachmentsFromString(
    note.content,
    /\(([0-9a-zA-Z-]*-[0-9a-zA-Z]{8,14}\.png)\)/g
  )
  const assetsFolderPathname = join(
    saveFolderPathname,
    `${exportedNoteName}_assets`
  )
  await exportNoteAssets(
    assetsFolderPathname,
    [],
    attachmentFilenames,
    attachmentMap
  )

  await writeFile(saveLocation, content)
  return
}

export const exportNoteAsHtmlFile = async (
  saveFolderPathname: string,
  saveFilename: string,
  note: NoteDoc,
  codeBlockTheme: string,
  generalThemeName: string,
  pushMessage: (context: any) => any,
  attachmentMap: ObjectMap<Attachment>,
  previewStyle?: string
): Promise<void> => {
  try {
    const markdownHtmlContent = await convertNoteDocToMarkdownHtmlString(
      note,
      codeBlockTheme
    )

    const exportedNoteName = `${filenamify(saveFilename)}`
    const exportedNoteFilename = `${exportedNoteName}.html`
    const saveLocation = join(saveFolderPathname, exportedNoteFilename)

    const cssStyles: CssStyleInfo[] = await getExportStylesInfo(
      codeBlockTheme,
      generalThemeName,
      previewStyle
    )
    const attachmentFilenames = extractAttachmentsFromString(
      markdownHtmlContent
    )
    const assetsFolderPathname = join(
      saveFolderPathname,
      `${exportedNoteName}_assets`
    )

    const savedAttachmentKeys = await exportNoteAssets(
      assetsFolderPathname,
      cssStyles,
      attachmentFilenames,
      attachmentMap
    )

    await writeKatexFonts(assetsFolderPathname)

    let contentWithValidImageSources = markdownHtmlContent
    for (const attachmentKey of savedAttachmentKeys) {
      const imageLinkPattern = `src="${attachmentKey}"`
      contentWithValidImageSources = contentWithValidImageSources.replace(
        new RegExp(imageLinkPattern, 'g'),
        `src="./${exportedNoteName}_assets/attachments/${attachmentKey}"`
      )
    }

    const htmlString = combineHtmlElementsIntoHtmlDocumentString(
      wrapContentInThemeHtml(contentWithValidImageSources, generalThemeName),
      generateCssForHtml(cssStyles, exportedNoteName),
      generateHtmlMetadataFromNote(note)
    )
    await writeFile(saveLocation, htmlString)
  } catch (error) {
    pushMessage({
      title: 'Note processing failed',
      description: 'Please check markdown syntax and try again later.',
    })
    console.warn(error)
  }
}

export async function convertNoteDocToPdfBuffer(
  note: NoteDoc,
  codeBlockTheme: string,
  generalThemeName: string,
  pushMessage: (context: any) => any,
  attachmentMap: ObjectMap<Attachment>,
  previewStyle?: string
): Promise<Buffer> {
  const markdownHtmlContent = await convertNoteDocToMarkdownHtmlString(
    note,
    codeBlockTheme
  )
  const [
    markdownContentWithValidLinks,
    attachmentUrls,
  ] = await updateAttachmentLinksToObjectUrls(
    markdownHtmlContent,
    pushMessage,
    attachmentMap
  )

  const htmlString = combineHtmlElementsIntoHtmlDocumentString(
    wrapContentInThemeHtml(markdownContentWithValidLinks, generalThemeName),
    await generateCssForPrintToPdf(
      codeBlockTheme,
      generalThemeName,
      previewStyle
    ),
    generateHtmlMetadataFromNote(note)
  )

  try {
    const printOpts = {
      // Needed for codemirorr themes (backgrounds)
      printBackground: true,
      // Enable margins if header and footer is printed!
      // No margins 1, default margins 0, 2 - minimum margins
      marginsType: 0, // This could be chosen by user.
      pageSize: 'A4', // This could be chosen by user.
    }
    return await convertHtmlStringToPdfBuffer(htmlString, printOpts)
  } finally {
    revokeAttachmentsUrls(attachmentUrls)
  }
}

export const exportNoteAsPdfFile = async (
  note: NoteDoc,
  codeBlockTheme: string,
  generalThemeName: string,
  pushMessage: (context: any) => any,
  attachmentMap: ObjectMap<Attachment>,
  previewStyle?: string
): Promise<void> => {
  try {
    const pdfBuffer = await convertNoteDocToPdfBuffer(
      note,
      codeBlockTheme,
      generalThemeName,
      pushMessage,
      attachmentMap,
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
