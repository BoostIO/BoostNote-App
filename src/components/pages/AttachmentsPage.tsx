import React from 'react'

import {
  StorageAttachmentsRouteParams,
  useRouteParams,
} from '../../lib/routeParams'
import { useDb } from '../../lib/db'
import styled from '../../lib/styled'
import { getFileList } from '../../lib/dnd'
import AttachmentList from '../organisms/AttachmentList'
import { mdiPaperclip } from '@mdi/js'
import PageDraggableHeader from '../atoms/PageDraggableHeader'
import { NoteStorage } from '../../lib/db/types'
import Application from '../Application'
import { topParentId } from '../../cloud/lib/mappers/topbarTree'
import { getAttachmentsHref } from '../../lib/db/utils'
import { push } from 'mixpanel-browser'

const Container = styled.div`
  height: 100%;
`

interface AttachmentsPageProps {
  storage: NoteStorage
}

const AttachmentsPage = ({ storage }: AttachmentsPageProps) => {
  const routeParams = useRouteParams() as StorageAttachmentsRouteParams
  const { workspaceId } = routeParams

  const { addAttachments } = useDb()

  const attachmentsHref = getAttachmentsHref(storage)
  return (
    <Application
      content={{
        topbar: {
          breadcrumbs: [
            {
              label: 'Attachments',
              active: true,
              parentId: topParentId,
              icon: mdiPaperclip,
              link: {
                href: attachmentsHref,
                navigateTo: () => push([attachmentsHref]),
              },
            },
          ],
        },
      }}
    >
      <Container
        onDragOver={(event: React.DragEvent) => {
          event.preventDefault()
        }}
        onDrop={(event: React.DragEvent) => {
          event.preventDefault()

          const files = getFileList(event)
          addAttachments(workspaceId, files)
        }}
      >
        <PageDraggableHeader
          iconPath={mdiPaperclip}
          label={`Attachments in ${storage.name}`}
        />

        <AttachmentList storage={storage} />
      </Container>
    </Application>
  )
}

export default AttachmentsPage
