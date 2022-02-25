import React, { useCallback, useMemo, useState } from 'react'
import WorkspaceExplorer from '../../../WorkspaceExplorer'
import { useNav } from '../../../../lib/stores/nav'
import Button from '../../../../../design/components/atoms/Button'
import styled from '../../../../../design/lib/styled'

interface FolderSelectProps {
  value: string | null
  update: (folderId: string) => void
}

const FolderSelect = ({ value, update }: FolderSelectProps) => {
  const { foldersMap, workspacesMap } = useNav()
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(() => {
    const initialFolder = foldersMap.get('')
    return initialFolder != null ? initialFolder.workspaceId : undefined
  })
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>(
    ''
  )
  const [folders, workspaces] = useMemo(() => {
    return [Array.from(foldersMap.values()), Array.from(workspacesMap.values())]
  }, [foldersMap, workspacesMap])

  const updateSelectedFolderId = useCallback(
    (folderId) => {
      if (folderId != null && folderId != '') {
        update(folderId)
      }
    },
    [update]
  )

  const folderName = useMemo(() => {
    const folder = foldersMap.get(value || '')
    if (folder != null) {
      return folder.name
    } else {
      return 'Unknown folder...'
    }
  }, [foldersMap, value])

  return (
    <FolderSelectContainer>
      {value != null && value != '' ? (
        <div>{folderName}</div>
      ) : (
        <div className={'folder__select__explorer__row'}>
          <WorkspaceExplorer
            workspaces={workspaces}
            folders={folders}
            selectedWorkspaceId={selectedWorkspaceId}
            selectedFolderId={selectedFolderId}
            setSelectedWorkspaceId={setSelectedWorkspaceId}
            setSelectedFolderId={setSelectedFolderId}
          />
          <Button
            className={'folder__select__save_button'}
            variant={'secondary'}
            onClick={() => updateSelectedFolderId(selectedFolderId)}
          >
            Save
          </Button>
        </div>
      )}
    </FolderSelectContainer>
  )
}

export default FolderSelect

const FolderSelectContainer = styled.div`
  display: flex;
  align-items: center;
  max-width: 600px;

  .folder__select__explorer__row {
    display: flex;
    flex-direction: column;
  }

  .folder__select__save_button {
    margin-top: ${({ theme }) => theme.sizes.spaces.sm}px;
    align-self: self-start;
  }
`
