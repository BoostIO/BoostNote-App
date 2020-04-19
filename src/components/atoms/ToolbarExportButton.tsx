import React, { useCallback } from 'react'
import { useContextMenu, MenuTypes } from '../../lib/contextMenu'
import { NoteDoc } from '../../lib/db/types'
import {
  exportNoteAsHtmlFile,
  exportNoteAsMarkdownFile,
} from '../../lib/exports'
import { usePreferences } from '../../lib/preferences'
import { usePreviewStyle } from '../../lib/preview'
import ToolbarButton from './ToolbarIconButton'
import { mdiExportVariant } from '@mdi/js'

interface ToolbarExportButtonProps {
  note: NoteDoc
  className?: string
}

const ToolbarExportButton = ({ note }: ToolbarExportButtonProps) => {
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
          onClick: async () =>
            await exportNoteAsHtmlFile(note, preferences, previewStyle),
        },
        {
          type: MenuTypes.Normal,
          label: 'Markdown export',
          onClick: async () => await exportNoteAsMarkdownFile(note),
        },
      ])
    },
    [popup, note, preferences, previewStyle]
  )

  return (
    <ToolbarButton
      active={false}
      onClick={openExportButtonContextMenu}
      iconPath={mdiExportVariant}
    />
  )
}

export default ToolbarExportButton
