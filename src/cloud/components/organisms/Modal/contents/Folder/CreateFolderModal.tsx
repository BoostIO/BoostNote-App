import React from 'react'
import { useNav } from '../../../../../lib/stores/nav'
import { ModalContainer } from '../styled'
import FolderModalForm from './FolderModalForm'

interface CreateFolderModalProps {
  parentFolderId?: string
  workspaceId?: string
}

const CreateFolderModal = ({
  parentFolderId,
  workspaceId,
}: CreateFolderModalProps) => {
  const { createFolderHandler } = useNav()
  return (
    <ModalContainer>
      <h2 style={{ margin: 0 }}>Create a folder</h2>
      <FolderModalForm
        parentFolderId={parentFolderId}
        onSubmitHandler={createFolderHandler}
        workspaceId={workspaceId}
      />
    </ModalContainer>
  )
}

export default CreateFolderModal
