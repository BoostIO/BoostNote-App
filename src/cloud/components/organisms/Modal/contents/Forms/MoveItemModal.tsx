import React, { useState, useCallback, useMemo } from 'react'
import { ModalContainer } from '../styled'
import { useModal } from '../../../../../lib/stores/modal'
import styled from '../../../../../lib/styled'
import CustomButton from '../../../../atoms/buttons/CustomButton'
import Flexbox from '../../../../atoms/Flexbox'
import WorkspaceExplorer from '../../../../molecules/WorkspaceExplorer'
import { useNav } from '../../../../../lib/stores/nav'
import { SerializedWorkspace } from '../../../../../interfaces/db/workspace'
import { sortByAttributeAsc } from '../../../../../lib/utils/array'

interface MoveItemModalProps {
  onSubmit: (workspaceId: string, parentFolderId?: string) => void
}

const MoveItemModal = ({ onSubmit }: MoveItemModalProps) => {
  const { closeModal } = useModal()
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>()
  const [selectedFolderId, setSelectedFolderId] = useState<string>()
  const { workspacesMap, foldersMap } = useNav()

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

  const onSubmitForm = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault()
      if (selectedWorkspaceId == null) {
        closeModal()
        return
      }

      onSubmit(selectedWorkspaceId, selectedFolderId)

      closeModal()
    },
    [onSubmit, selectedWorkspaceId, selectedFolderId, closeModal]
  )

  return (
    <ModalContainer>
      <StyledModalForm
        onSubmit={onSubmitForm}
        style={{ height: '100%', margin: 0 }}
      >
        <h3>Pick your destination</h3>
        <Flexbox
          direction='column'
          flex='1 1 auto'
          style={{ width: '100%', height: '100%' }}
        >
          <WorkspaceExplorer
            folders={sortedFolders}
            workspaces={sortedWorkspaces}
            selectedWorkspaceId={selectedWorkspaceId}
            selectedFolderId={selectedFolderId}
            setSelectedFolderId={setSelectedFolderId}
            setSelectedWorkspaceId={setSelectedWorkspaceId}
          />
          <Flexbox
            flex='0 0 auto'
            justifyContent='flex-end'
            style={{ width: '100%', marginTop: 20 }}
          >
            <CustomButton
              variant='primary'
              type='submit'
              disabled={selectedWorkspaceId == null}
            >
              Move
            </CustomButton>
          </Flexbox>
        </Flexbox>
      </StyledModalForm>
    </ModalContainer>
  )
}

export default MoveItemModal

const StyledModalForm = styled.form`
  display: block;
  width: 100%;
  position: relative;
  user-select: none;
  height: auto;
  margin: 2px 0;
  border-top: 1px solid transparent;
  border-bottom: 1px solid transparent;
  margin-bottom: ${({ theme }) => theme.space.small}px;
`
