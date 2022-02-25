import React, { useCallback, useMemo, useState } from 'react'
import WorkspaceExplorer from '../../../WorkspaceExplorer'
import { useNav } from '../../../../lib/stores/nav'
import Button from '../../../../../design/components/atoms/Button'
import styled from '../../../../../design/lib/styled'
import FormRowItem from '../../../../../design/components/molecules/Form/templates/FormRowItem'
import { useToast } from '../../../../../design/lib/stores/toast'

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
  const [showingFolderExplorer, setShowingFolderExplorer] =
    useState<boolean>(false)
  const { pushMessage } = useToast()

  const [folders, workspaces] = useMemo(() => {
    return [Array.from(foldersMap.values()), Array.from(workspacesMap.values())]
  }, [foldersMap, workspacesMap])

  const saveSelectedFolderId = useCallback(
    (folderId) => {
      if (folderId != null && folderId != '') {
        update(folderId)
      } else {
        pushMessage({
          title: 'Folder selection (change) failed.',
          description: 'Please select a valid folder.',
        })
      }
      setShowingFolderExplorer(false)
    },
    [pushMessage, update]
  )

  const folderName = useMemo(() => {
    const folder = foldersMap.get(value || '')
    const workspace = workspacesMap.get(value || '')
    if (folder != null) {
      return folder.name
    } else if (workspace != null) {
      return workspace.name
    } else {
      return null
    }
  }, [foldersMap, value, workspacesMap])

  return (
    <FolderSelectContainer>
      <FormRowItem
        className={'folder__select__row_container'}
        item={{
          type: 'select',
          props: {
            placeholder: 'Select..',
            value:
              folderName == null
                ? null
                : { label: folderName, value: value || '' },
            options: [],
            onChange: () => {
              // no need - used as a selector opener which will call on change when needed
            },
            onMenuOpen: () => {
              setShowingFolderExplorer(!showingFolderExplorer)
            },
            isMenuOpen: false,
          },
        }}
      />

      {showingFolderExplorer && (
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
            onClick={() =>
              saveSelectedFolderId(
                selectedFolderId != null
                  ? selectedFolderId
                  : selectedWorkspaceId
              )
            }
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
  flex-direction: column;
  align-items: self-start;
  max-width: 800px;

  .folder__select__row_container {
    min-width: 160px;
  }

  .folder__select__explorer__row {
    margin-top: ${({ theme }) => theme.sizes.spaces.sm}px;
    display: flex;
    flex-direction: column;
  }

  .folder__select__save_button {
    margin-top: ${({ theme }) => theme.sizes.spaces.sm}px;
    align-self: self-start;
  }
`
