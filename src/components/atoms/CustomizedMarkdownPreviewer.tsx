import React from 'react'
import { usePreferences } from '../../lib/preferences'
import MarkdownPreviewer from './MarkdownPreviewer'
import { usePreviewStyle } from '../../lib/preview'

interface CustomizedMarkdownPreviewer {
  content: string
  storageId?: string
  updateContent?: any
}

const CustomizedMarkdownPreviewer = ({
  content,
  storageId,
  updateContent
}: CustomizedMarkdownPreviewer) => {
  const { preferences } = usePreferences()
  const { previewStyle } = usePreviewStyle()

  return (
    <MarkdownPreviewer
      content={content}
      storageId={storageId}
      codeBlockTheme={preferences['markdown.codeBlockTheme']}
      theme={preferences['general.theme']}
      style={previewStyle}
      updateContent={updateContent}
    />
  )
}

export default CustomizedMarkdownPreviewer
