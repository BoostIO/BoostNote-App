import React, { useCallback } from 'react'
import styled from '../../lib/styled'
import { iconColor } from '../../lib/styled/styleFunctions'
import { useContextMenu, MenuTypes } from '../../lib/contextMenu'
import { NoteDoc } from '../../lib/db/types'
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
import { usePreferences } from '../../lib/preferences'
import { rehypeCodeMirror } from './MarkdownPreviewer'
import { usePreviewStyle } from '../../lib/preview'

const sanitizeSchema = mergeDeepRight(gh, {
  attributes: { '*': ['className'] }
})

const StyledButton = styled.button<{ active: boolean }>`
  background: transparent;
  height: 32px;
  box-sizing: border-box;
  font-size: 14px;
  outline: none;
  border: none;
  ${iconColor}
  &:first-child {
    margin-left: 0;
  }
  &:last-child {
    margin-right: 0;
  }
`

interface ToolbarExportButtonProps {
  note: NoteDoc
  className?: string
}

const ToolbarExportButton = ({ className, note }: ToolbarExportButtonProps) => {
  const { popup } = useContextMenu()
  const { preferences } = usePreferences()
  const { previewStyle } = usePreviewStyle()

  const openExportButtonContextMenu = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault()
      popup(event, [
        {
          type: MenuTypes.Normal,
          label: 'HTML export',
          onClick: async () => await exportToHtml()
        },
        {
          type: MenuTypes.Normal,
          label: 'Markdown export',
          onClick: async () => await exportToMarkdown()
        }
      ])
    },
    [popup]
  )

  const downloadFile = (
    content: string,
    fileName: string,
    type: string = 'text/plain'
  ) => {
    const anchor = document.createElement('a')
    anchor.style.display = 'none'
    document.body.appendChild(anchor)
    anchor.href = window.URL.createObjectURL(new Blob([content], { type }))
    anchor.setAttribute('download', fileName)
    anchor.click()
    window.URL.revokeObjectURL(anchor.href)
    document.body.removeChild(anchor)
  }

  const exportToHtml = async () => {
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

        downloadFile(
          file.toString(),
          `${note.title.toLowerCase().replace(/\s+/g, '-')}.html`,
          'text/html'
        )
        return
      })
  }

  const exportToMarkdown = async () => {
    console.log('export markdown')
    await unified()
      .use(remarkParse)
      .use(remarkStringify)
      .process(note.content, (err, file) => {
        if (err != null) {
          /* TODO: Toast error */
          console.error(err)
          return
        }
        downloadFile(
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

  return (
    <StyledButton
      active={false}
      onClick={openExportButtonContextMenu}
      className={className}
    >
      <span>Export</span>
    </StyledButton>
  )
}

export default ToolbarExportButton
