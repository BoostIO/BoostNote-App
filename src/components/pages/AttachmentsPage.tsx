import React from 'react'
import { StorageAttachmentsRouteParams, useRouteParams } from '../../lib/router'
import { useDb } from '../../lib/db'
import styled from '../../lib/styled'
import { getFileList } from '../../lib/dnd'
import AttachmentList from '../organisms/AttachmentList'
import { mdiPaperclip } from '@mdi/js'
import PageDraggableHeader from '../atoms/PageDraggableHeader'

const Container = styled.div`
  height: 100%;
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
      <PageDraggableHeader
        iconPath={mdiPaperclip}
        label={`Attachments in ${storage.name}`}
      />

      <AttachmentList storage={storage} />
    </Container>
  )
}

export default AttachmentsPage
