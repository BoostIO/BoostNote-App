import React, { useMemo, useState, useEffect } from 'react'
import styled from '../../lib/styled'
import { NoteStorage, Attachment, AttachmentData } from '../../lib/db/types'
import { useContextMenu, MenuTypes } from '../../lib/contextMenu'
// import { downloadBlob } from '../../lib/download'
import { useDialog, DialogIconTypes } from '../../lib/dialog'
import { useDb } from '../../lib/db'
import { values } from '../../lib/db/utils'
import { downloadBlob } from '../../lib/download'
import { openNew } from '../../lib/platform'

const ListContainer = styled.div`
  display: flex;
  align-items: center;
`

const ListItem = styled.div`
  width: 80px;
  height: 80px;
  margin: 10px;
  background-size: cover;
  background-position: 50%;
`

interface AttachmentListItemProps {
  storageId: string
  attachment: Attachment
}

const AttachmentListItem = ({
  storageId,
  attachment,
}: AttachmentListItemProps) => {
  const { popup } = useContextMenu()
  const { messageBox } = useDialog()
  const { removeAttachment } = useDb()
  const [data, setData] = useState<AttachmentData | null>(null)
  useEffect(() => {
    attachment.getData().then((data) => {
      setData(data)
    })
  }, [attachment])

  const src = useMemo(() => {
    if (data == null) {
      return ''
    }
    switch (data.type) {
      case 'blob':
        return URL.createObjectURL(data.blob)
      case 'src':
        return data.src
    }
  }, [data])
  useEffect(() => {
    return () => {
      URL.revokeObjectURL(src)
    }
  }, [src])

  if (data == null) {
    return null
  }
  return (
    <ListItem
      key={attachment!.name}
      style={{
        backgroundImage: `url("${src}")`,
      }}
      onContextMenu={(event: React.MouseEvent) => {
        event.preventDefault()

        popup(event, [
          data.type === 'blob'
            ? {
                type: MenuTypes.Normal,
                label: 'Download',
                onClick: () => {
                  downloadBlob(data.blob, attachment.name)
                },
              }
            : {
                type: MenuTypes.Normal,
                label: 'Open',
                onClick: () => {
                  openNew(data.src)
                },
              },
          {
            type: MenuTypes.Normal,
            label: 'Remove Attachment',
            onClick: () => {
              messageBox({
                title: `Remove Attachment`,
                message: 'The attachment will be deleted permanently.',
                iconType: DialogIconTypes.Warning,
                buttons: ['Delete Attachment', 'Cancel'],
                defaultButtonIndex: 0,
                cancelButtonIndex: 1,
                onClose: (value: number | null) => {
                  if (value === 0) {
                    removeAttachment(storageId, attachment.name)
                  }
                },
              })
            },
          },
        ])
      }}
    />
  )
}
interface AttachmentListProps {
  storage: NoteStorage
}

const AttachmentList = ({ storage }: AttachmentListProps) => {
  const { attachmentMap } = storage

  return (
    <ListContainer>
      {useMemo(() => {
        return values(attachmentMap).map((attachment) => {
          return (
            <AttachmentListItem
              storageId={storage.id}
              attachment={attachment}
              key={attachment.name}
            />
          )
        })
      }, [attachmentMap, storage])}
    </ListContainer>
  )
}

export default AttachmentList
