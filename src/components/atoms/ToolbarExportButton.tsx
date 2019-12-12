import React, { useCallback } from 'react'
import styled from '../../lib/styled'
import { iconColor } from '../../lib/styled/styleFunctions'
import { useContextMenu, MenuTypes } from '../../lib/contextMenu'
import { NoteDoc } from '../../lib/db/types'
import { mdiFileExport } from '@mdi/js'
import Icon from './Icon'
import { exportToHtml, exportToMarkdown } from '../../lib/exports'
import { usePreferences } from '../../lib/preferences'
import { usePreviewStyle } from '../../lib/preview'

const StyledButton = styled.button<{ active: boolean }>`
  background: transparent;
  height: 32px;
  box-sizing: border-box;
  font-size: 14px;
  outline: none;
  border: none;
  ${iconColor}
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
            await exportToHtml(note, preferences, previewStyle)
        },
        {
          type: MenuTypes.Normal,
          label: 'Markdown export',
          onClick: async () => await exportToMarkdown(note)
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
      <Icon path={mdiFileExport} />
    </StyledButton>
  )
}

export default ToolbarExportButton
