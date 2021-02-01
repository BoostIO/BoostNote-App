import React, { useMemo, useCallback, useState } from 'react'
import { SerializedWorkspace } from '../../../interfaces/db/workspace'
import { SerializedFolderWithBookmark } from '../../../interfaces/db/folder'
import {
  StyledWorkspaceExplorerWrapper,
  StyledExplorerDepth,
  StyledWorkspaceExplorer,
} from './styled'
import { mdiLock } from '@mdi/js'
import ExplorerListItem from './ExplorerListItem'
import FolderExplorer from './FolderExplorer'

interface WorkspaceExplorerProps {
  selectedWorkspaceId?: string
  selectedFolderId?: string
  workspaces: SerializedWorkspace[]
  folders: SerializedFolderWithBookmark[]
  setSelectedWorkspaceId: React.Dispatch<
    React.SetStateAction<string | undefined>
  >
  setSelectedFolderId: React.Dispatch<React.SetStateAction<string | undefined>>
}

const WorkspaceExplorer = ({
  workspaces,
  folders,
  selectedWorkspaceId,
  selectedFolderId,
  setSelectedFolderId,
  setSelectedWorkspaceId,
}: WorkspaceExplorerProps) => {
  const [nestedIds, setNestedIds] = useState<string[]>([])
  const childFoldersPerParentMap = useMemo(() => {
    return folders.reduce((acc, folder) => {
      if (folder.parentFolderId == null) {
        return acc
      }

      const val = [...(acc.get(folder.parentFolderId) || []), folder]
      acc.set(folder.parentFolderId, val)
      return acc
    }, new Map<string, SerializedFolderWithBookmark[]>())
  }, [folders])

  const rootFoldersPerParentMap = useMemo(() => {
    return folders.reduce((acc, folder) => {
      if (folder.parentFolderId != null) {
        return acc
      }
      const val = [...(acc.get(folder.workspaceId) || []), folder]
      acc.set(folder.workspaceId, val)
      return acc
    }, new Map<string, SerializedFolderWithBookmark[]>())
  }, [folders])

  const selectWorkspace = useCallback(
    (workspace: SerializedWorkspace) => {
      setSelectedFolderId(undefined)
      setSelectedWorkspaceId(workspace.id)
      setNestedIds([])
    },
    [setSelectedFolderId, setSelectedWorkspaceId]
  )

  return (
    <StyledWorkspaceExplorer>
      <StyledWorkspaceExplorerWrapper>
        <StyledExplorerDepth>
          {workspaces.map((workspace) => (
            <ExplorerListItem
              key={workspace.id}
              iconPath={!workspace.public ? mdiLock : undefined}
              isInCurrentTree={selectedWorkspaceId === workspace.id}
              isLastChildInCurrentTree={
                selectedWorkspaceId === workspace.id && selectedFolderId == null
              }
              label={workspace.name}
              hasChildren={
                (rootFoldersPerParentMap.get(workspace.id) || []).length > 0
              }
              onClick={() => selectWorkspace(workspace)}
            />
          ))}
        </StyledExplorerDepth>
        {selectedWorkspaceId != null && (
          <FolderExplorer
            childFoldersPerParentMap={childFoldersPerParentMap}
            rootFolders={rootFoldersPerParentMap.get(selectedWorkspaceId)}
            selectedFolderId={selectedFolderId}
            setSelectedFolderId={setSelectedFolderId}
            nestedIds={nestedIds}
            setNestedIds={setNestedIds}
          />
        )}
      </StyledWorkspaceExplorerWrapper>
    </StyledWorkspaceExplorer>
  )
}

export default WorkspaceExplorer
