import React from 'react'
import { ModalContainer } from '../styled'
import WorkspaceModalForm from './WorkspaceModalForm'
import { SerializedWorkspace } from '../../../../../interfaces/db/workspace'

interface EditWorkspaceModalProps {
  workspace: SerializedWorkspace
}
const EditWorkspaceModal = ({ workspace }: EditWorkspaceModalProps) => {
  return (
    <ModalContainer style={{ overflow: 'auto ' }}>
      <h2 style={{ margin: 0 }}>Edit your Workspace</h2>
      <WorkspaceModalForm workspace={workspace} />
    </ModalContainer>
  )
}

export default EditWorkspaceModal
