import React from 'react'
import { useNav } from '../../../../../lib/stores/nav'
import { ModalContainer, ModalHeader } from '../styled'
import FolderModalForm from './FolderModalForm'
import {
  SerializedFolder,
  SerializedFolderWithBookmark,
} from '../../../../../interfaces/db/folder'
import { UpdateFolderRequestBody } from '../../../../../api/teams/folders'

interface EditFolderModalProps {
  folder: SerializedFolder | SerializedFolderWithBookmark
}

const EditFolderModal = ({ folder }: EditFolderModalProps) => {
  const { updateFolderHandler } = useNav()

  const onSubmitHandler = (body: UpdateFolderRequestBody) => {
    return updateFolderHandler(folder, body)
  }

  return (
    <ModalContainer>
      <ModalHeader>Edit Folder</ModalHeader>
      <FolderModalForm
        workspaceId={folder.workspaceId}
        parentFolderId={folder.parentFolderId}
        initialFolderName={folder.name}
        initialEmoji={folder.emoji}
        initialDescription={folder.description}
        onSubmitHandler={onSubmitHandler}
        filteredOutPathname={folder.pathname}
        edit={true}
      />
    </ModalContainer>
  )
}

export default EditFolderModal
