import React from 'react'
import { usePreferences } from '../../lib/preferences'
import MarkdownPreviewer from './MarkdownPreviewer'

interface CustomizedMarkdownPreviewer {
  content: string
}

const CustomizedMarkdownPreviewer = ({
  content
}: CustomizedMarkdownPreviewer) => {
  const { preferences } = usePreferences()

  return (
    <MarkdownPreviewer
      content={content}
      theme={preferences['markdown.codeBlockTheme']}
    />
  )
}

export default CustomizedMarkdownPreviewer
