import React, { useMemo, useState, useEffect } from 'react'
import { NoteStorage, Attachment, AttachmentData } from '../../lib/db/types'
import { useDb } from '../../lib/db'
import { values } from '../../lib/db/utils'
import { downloadBlob } from '../../lib/download'
import { openNew } from '../../lib/platform'
import { openContextMenu } from '../../lib/electronOnly'
import copy from 'copy-to-clipboard'
import styled from '../../shared/lib/styled'
import { useDialog, DialogIconTypes } from '../../shared/lib/stores/dialog'

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

        openContextMenu({
          menuItems: [
            data.type === 'blob'
              ? {
                  type: 'normal',
                  label: 'Download',
                  click: () => {
                    downloadBlob(data.blob, attachment.name)
                  },
                }
              : {
                  type: 'normal',
                  label: 'Open',
                  click: () => {
                    openNew(data.src)
                  },
                },
            {
              type: 'normal',
              label: 'Copy Attachment Name',
              click: () => {
                copy(attachment.name)
              },
            },
            // todo: [komediruzecki-22/05/2021] Remove attachment add to localUI component - test also
            {
              type: 'normal',
              label: 'Remove Attachment',
              click: () => {
                messageBox({
                  title: `Remove Attachment`,
                  message: 'The attachment will be deleted permanently.',
                  iconType: DialogIconTypes.Warning,
                  buttons: [
                    {
                      label: 'Delete Attachment',
                      defaultButton: true,
                      onClick: () => {
                        removeAttachment(storageId, attachment.name)
                      },
                    },
                    { label: 'Cancel', cancelButton: true },
                  ],
                })
              },
            },
          ],
        })
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
