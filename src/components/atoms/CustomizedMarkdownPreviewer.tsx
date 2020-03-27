import React from 'react'
import { usePreferences } from '../../lib/preferences'
import MarkdownPreviewer from './MarkdownPreviewer'
import { usePreviewStyle } from '../../lib/preview'
import { ObjectMap, Attachment } from '../../lib/db/types'

interface CustomizedMarkdownPreviewer {
  content: string
  attachmentMap?: ObjectMap<Attachment>
}

const CustomizedMarkdownPreviewer = ({
  content,
  attachmentMap,
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
    />
  )
}

export default CustomizedMarkdownPreviewer
