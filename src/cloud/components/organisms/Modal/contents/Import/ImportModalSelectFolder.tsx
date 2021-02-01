import React, { useMemo } from 'react'
import { StyledImportModalContent, StyledImportModalFooter } from './styled'
import { useNav } from '../../../../../lib/stores/nav'
import CustomButton from '../../../../atoms/buttons/CustomButton'
import { sortByAttributeAsc } from '../../../../../lib/utils/array'
import { SerializedWorkspace } from '../../../../../interfaces/db/workspace'
import WorkspaceExplorer from '../../../../molecules/WorkspaceExplorer'

interface ImportModalSelectFolderProps {
  selectedWorkspaceId?: string
  selectedFolderId?: string
  setSelectedWorkspaceId: React.Dispatch<
    React.SetStateAction<string | undefined>
  >
  setSelectedFolderId: React.Dispatch<React.SetStateAction<string | undefined>>
  onCancel: () => void
  onSelect: () => void
}

const ImportModalSelectFolder = ({
  selectedWorkspaceId,
  selectedFolderId,
  setSelectedFolderId,
  setSelectedWorkspaceId,
  onCancel,
  onSelect,
}: ImportModalSelectFolderProps) => {
  const { foldersMap, workspacesMap } = useNav()
  const wrapperRef = React.createRef<HTMLDivElement>()

  const sortedWorkspaces = useMemo(() => {
    const workspaces = [...workspacesMap.values()]
    const {
      public: publicWorkspaces,
      private: privateWorkspaces,
    } = workspaces.reduce<{
      public: SerializedWorkspace[]
      private: SerializedWorkspace[]
    }>(
      (acc, workspace) => {
        if (workspace.public) {
          acc.public.push(workspace)
        } else {
          acc.private.push(workspace)
        }
        return acc
      },
      { public: [], private: [] }
    )

    return [
      ...sortByAttributeAsc('name', publicWorkspaces),
      ...sortByAttributeAsc('name', privateWorkspaces),
    ]
  }, [workspacesMap])

  const sortedFolders = useMemo(() => {
    return sortByAttributeAsc('name', [...foldersMap.values()])
  }, [foldersMap])

  return (
    <>
      <StyledImportModalContent ref={wrapperRef} tabIndex={-1}>
        <h2 style={{ margin: 0 }}>Select a folder</h2>
        <p>Pick the folder you want your documents to be imported in</p>
        <WorkspaceExplorer
          folders={sortedFolders}
          workspaces={sortedWorkspaces}
          selectedWorkspaceId={selectedWorkspaceId}
          selectedFolderId={selectedFolderId}
          setSelectedFolderId={setSelectedFolderId}
          setSelectedWorkspaceId={setSelectedWorkspaceId}
        />
      </StyledImportModalContent>
      <StyledImportModalFooter>
        <CustomButton variant='secondary' onClick={onCancel}>
          Previous
        </CustomButton>
        <CustomButton
          variant='primary'
          disabled={selectedWorkspaceId == null && selectedFolderId == null}
          onClick={onSelect}
        >
          Upload
        </CustomButton>
      </StyledImportModalFooter>
    </>
  )
}

export default ImportModalSelectFolder
