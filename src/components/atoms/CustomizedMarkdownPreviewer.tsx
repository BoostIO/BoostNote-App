import React from 'react'
import { usePreferences } from '../../lib/preferences'
import MarkdownPreviewer from './MarkdownPreviewer'
import { usePreviewStyle } from '../../lib/preview'
import { ObjectMap, Attachment } from '../../lib/db/types'

interface CustomizedMarkdownPreviewer {
  content: string
  attachmentMap?: ObjectMap<Attachment>
  updateContent: (newValue: string) => void
}

const CustomizedMarkdownPreviewer = ({
  content,
  attachmentMap,
  updateContent,
}: CustomizedMarkdownPreviewer) => {
  const { preferences } = usePreferences()
  const { previewStyle } = usePreviewStyle()

  return (
    <MarkdownPreviewer
      content={content}
      attachmentMap={attachmentMap}
      codeBlockTheme={preferences['markdown.codeBlockTheme']}
      theme={preferences['general.theme']}
      style={previewStyle}
      updateContent={updateContent}
    />
  )
}

export default CustomizedMarkdownPreviewer
