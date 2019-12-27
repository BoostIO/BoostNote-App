import React, { useCallback } from 'react'
import styled from '../../lib/styled'
import { noteListIconColor } from '../../lib/styled/styleFunctions'
import { useContextMenu, MenuTypes } from '../../lib/contextMenu'
import { NoteDoc } from '../../lib/db/types'
import {
  exportNoteAsHtmlFile,
  exportNoteAsMarkdownFile
} from '../../lib/exports'
import { usePreferences } from '../../lib/preferences'
import { usePreviewStyle } from '../../lib/preview'
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
