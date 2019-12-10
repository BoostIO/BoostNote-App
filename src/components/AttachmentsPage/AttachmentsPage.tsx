import React from 'react'
import { StorageAttachmentsRouteParams, useRouteParams } from '../../lib/router'
import { useDb } from '../../lib/db'
import styled from '../../lib/styled'
import { getFileList } from '../../lib/dnd'
import { borderBottom } from '../../lib/styled/styleFunctions'
import AttachmentList from './AttachmentList'

const Container = styled.div`
  height: 100%;
`

const Header = styled.div`
  height: 40px;
  padding: 10px;
  width: 100%;
  ${borderBottom}
`

const AttachmentsPage = () => {
  const routeParams = useRouteParams() as StorageAttachmentsRouteParams
  const { storageId } = routeParams

  const { addAttachments, storageMap } = useDb()
  const storage = storageMap[storageId]
  if (storage == null) {
    return <div>Storage does not exist.</div>
  }

  return (
    <Container
      onDragOver={(event: React.DragEvent) => {
        event.preventDefault()
      }}
      onDrop={(event: React.DragEvent) => {
        event.preventDefault()

        const files = getFileList(event)
        addAttachments(storageId, files)
      }}
    >
      <Header>Attachments in {storage.name}</Header>
      <AttachmentList storage={storage} />
    </Container>
  )
}

export default AttachmentsPage
