import React, { useCallback } from 'react'
import styled from 'Lib/styled'
import { noteListIconColor } from 'Lib/styled/styleFunctions'
import { useContextMenu, MenuTypes } from 'Lib/contextMenu'
import { NoteDoc } from 'Lib/db/types'
import {
  exportNoteAsHtmlFile,
  exportNoteAsMarkdownFile
} from 'Lib/exports'
import { usePreferences } from 'Lib/preferences'
import { usePreviewStyle } from 'Lib/preview'
import { IconInfo } from '../icons'

const StyledButton = styled.button<{ active: boolean }>`
  background: transparent;
  height: 32px;
  box-sizing: border-box;
  outline: none;
  font-size: 16px;
  border: none;
  ${noteListIconColor}
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
          onClick: async () =>
            await exportNoteAsHtmlFile(note, preferences, previewStyle)
        },
        {
          type: MenuTypes.Normal,
          label: 'Markdown export',
          onClick: async () => await exportNoteAsMarkdownFile(note)
        }
      ])
    },
    [popup, note, preferences, previewStyle]
  )

  return (
    <StyledButton
      active={false}
      onClick={openExportButtonContextMenu}
      className={className}
    >
      <IconInfo />
    </StyledButton>
  )
}

export default ToolbarExportButton
