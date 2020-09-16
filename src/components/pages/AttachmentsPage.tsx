import React from 'react'
import { StorageAttachmentsRouteParams, useRouteParams } from '../../lib/router'
import { useDb } from '../../lib/db'
import styled from '../../lib/styled'
import { getFileList } from '../../lib/dnd'
import AttachmentList from '../organisms/AttachmentList'
import { mdiPaperclip } from '@mdi/js'
import PageDraggableHeader from '../atoms/PageDraggableHeader'
import { NoteStorage } from '../../lib/db/types'
import StorageLayout from '../atoms/StorageLayout'

const Container = styled.div`
  height: 100%;
`

interface AttachmentsPageProps {
  storage: NoteStorage
}

const AttachmentsPage = ({ storage }: AttachmentsPageProps) => {
  const routeParams = useRouteParams() as StorageAttachmentsRouteParams
  const { storageId } = routeParams

  const { addAttachments } = useDb()

  return (
    <StorageLayout storage={storage}>
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
    </StorageLayout>
  )
}

export default AttachmentsPage
