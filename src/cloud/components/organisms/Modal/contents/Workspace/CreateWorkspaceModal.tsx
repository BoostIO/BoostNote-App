import React from 'react'
import { ModalContainer } from '../styled'
import WorkspaceModalForm from './WorkspaceModalForm'

const CreateWorkspaceModal = () => {
  return (
    <ModalContainer style={{ overflow: 'auto ' }}>
      <h2 style={{ margin: 0 }}>Create a Workspace</h2>
      <WorkspaceModalForm />
    </ModalContainer>
  )
}

export default CreateWorkspaceModal
