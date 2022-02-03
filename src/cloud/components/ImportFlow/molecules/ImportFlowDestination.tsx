import React, { useMemo, useRef } from 'react'
import { useNav } from '../../../lib/stores/nav'
import { sortByAttributeAsc } from '../../../lib/utils/array'
import { SerializedWorkspace } from '../../../interfaces/db/workspace'
import WorkspaceExplorer from '../../WorkspaceExplorer'
import { useI18n } from '../../../lib/hooks/useI18n'
import { lngKeys } from '../../../lib/i18n/types'
import Button from '../../../../design/components/atoms/Button'
import styled from '../../../../design/lib/styled'

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
  const wrapperRef = useRef<HTMLDivElement>(null)
  const { translate } = useI18n()

  const sortedWorkspaces = useMemo(() => {
    const workspaces = [...workspacesMap.values()]
    const { public: publicWorkspaces, private: privateWorkspaces } =
      workspaces.reduce<{
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
    <Container className='import__destination'>
      <div
        className='import__destination__content'
        ref={wrapperRef}
        tabIndex={-1}
      >
        <p>{translate(lngKeys.ModalsImportDestinationDisclaimer)}</p>
        <WorkspaceExplorer
          folders={sortedFolders}
          workspaces={sortedWorkspaces}
          selectedWorkspaceId={selectedWorkspaceId}
          selectedFolderId={selectedFolderId}
          setSelectedFolderId={setSelectedFolderId}
          setSelectedWorkspaceId={setSelectedWorkspaceId}
        />
      </div>
      <div className='import__destination__footer'>
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
      </div>
    </Container>
  )
}

const Container = styled.div`
  .import__destination__footer {
    margin-top: ${({ theme }) => theme.sizes.spaces.df}px;
  }
`

export default ImportModalSelectFolder
