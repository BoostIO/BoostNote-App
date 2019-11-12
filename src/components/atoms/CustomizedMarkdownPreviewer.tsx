import React from 'react'
import { usePreferences } from '../../lib/preferences'
import MarkdownPreviewer from './MarkdownPreviewer'
import { usePreviewStyle } from '../../lib/preview'

interface CustomizedMarkdownPreviewer {
  content: string
}

const CustomizedMarkdownPreviewer = ({
  content
}: CustomizedMarkdownPreviewer) => {
  const { preferences } = usePreferences()
  const { previewStyle } = usePreviewStyle()

  return (
    <MarkdownPreviewer
      content={content}
      theme={preferences['markdown.codeBlockTheme']}
      style={previewStyle}
    />
  )
}

export default CustomizedMarkdownPreviewer
