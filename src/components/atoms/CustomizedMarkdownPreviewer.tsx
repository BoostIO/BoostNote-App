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
      codeBlockTheme={preferences['markdown.codeBlockTheme']}
      theme={preferences['general.theme']}
      style={previewStyle}
    />
  )
}

export default CustomizedMarkdownPreviewer
