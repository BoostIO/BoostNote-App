import { osName } from '../../../../shared/lib/platform'
import { NoteStorage } from '../../../db/types'
import React from 'react'

export function mapLocalSpace(
  workspace: NoteStorage,
  workspaceIndex: number,
  activeWorkspaceId: string | null,
  linkOnClick: (event: React.MouseEvent, workspace: NoteStorage) => void,
  linkOnContextMenu: (event: React.MouseEvent, workspace: NoteStorage) => void
) {
  return {
    label: workspace.name,
    active: activeWorkspaceId === workspace.id,
    tooltip: `${osName === 'macos' ? '⌘' : 'Ctrl'} ${workspaceIndex + 1}`,
    linkProps: {
      onClick: (event: React.MouseEvent) => linkOnClick(event, workspace),
      onContextMenu: (event: React.MouseEvent) =>
        linkOnContextMenu(event, workspace),
    },
  }
}
