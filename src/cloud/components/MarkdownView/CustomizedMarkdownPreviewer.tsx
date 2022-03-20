import React from 'react'
import MarkdownView, { SelectionState } from './index'
import { usePreviewStyle } from '../../../lib/preview'
import { EmbedDoc } from '../../lib/docEmbedPlugin'
import { useSettings } from '../../lib/stores/settings'

interface CustomizedMarkdownViewProps {
  content: string
  customBlockRenderer?: (name: string) => JSX.Element
  updateContent?: (
    newContentOrUpdater: string | ((newValue: string) => string),
    refocusEditorAndCursor?: boolean
  ) => void
  shortcodeHandler?: ({ identifier, entityId }: any) => JSX.Element
  headerLinks?: boolean
  onRender?: () => void
  className?: string
  getEmbed?: (
    id: string
  ) => Promise<EmbedDoc | undefined> | EmbedDoc | undefined
  scrollerRef?: React.RefObject<HTMLDivElement>
  SelectionMenu?: React.ComponentType<{ selection: SelectionState['context'] }>
  codeFence?: boolean
  previewStyle?: string
}

const CustomizedMarkdownPreviewer = ({
  content,
  updateContent,
  shortcodeHandler,
  headerLinks = true,
  onRender,
  className,
  getEmbed,
  scrollerRef,
  codeFence = true,
}: CustomizedMarkdownViewProps) => {
  const { previewStyle } = usePreviewStyle()
  const { settings } = useSettings()

  return (
    <MarkdownView
      content={content}
      updateContent={updateContent}
      shortcodeHandler={shortcodeHandler}
      headerLinks={headerLinks}
      onRender={onRender}
      className={className}
      getEmbed={getEmbed}
      scrollerRef={scrollerRef}
      codeFence={codeFence}
      previewStyle={previewStyle}
      codeBlockTheme={settings['general.codeBlockTheme']}
    />
  )
}

export default CustomizedMarkdownPreviewer
