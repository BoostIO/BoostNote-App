import React, { useMemo } from 'react'
import { StyledImportModalContent, StyledImportModalFooter } from './styled'
import { useNav } from '../../../../../lib/stores/nav'
import { sortByAttributeAsc } from '../../../../../lib/utils/array'
import { SerializedWorkspace } from '../../../../../interfaces/db/workspace'
import WorkspaceExplorer from '../../../../molecules/WorkspaceExplorer'
import { useI18n } from '../../../../../lib/hooks/useI18n'
import { lngKeys } from '../../../../../lib/i18n/types'
import Button from '../../../../../../shared/components/atoms/Button'

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
  const { translate } = useI18n()

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
        <h2 style={{ margin: 0 }}>
          {translate(lngKeys.ModalsImportDestinationTitle)}
        </h2>
        <p>{translate(lngKeys.ModalsImportDestinationDisclaimer)}</p>
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
        <Button variant='secondary' onClick={onCancel}>
          {translate(lngKeys.GeneralPrevious)}
        </Button>
        <Button
          variant='primary'
          disabled={selectedWorkspaceId == null && selectedFolderId == null}
          onClick={onSelect}
        >
          {translate(lngKeys.GeneralImport)}
        </Button>
      </StyledImportModalFooter>
    </>
  )
}

export default ImportModalSelectFolder
