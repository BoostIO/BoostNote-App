import React, { useMemo } from 'react'
import styled from '../../lib/styled'
import { NoteStorage, Attachment } from '../../lib/db/types'
import { useContextMenu, MenuTypes } from '../../lib/contextMenu'
import { downloadBlob } from '../../lib/download'
import { useDialog, DialogIconTypes } from '../../lib/dialog'
import { useDb } from '../../lib/db'

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
interface AttachmentListProps {
  storage: NoteStorage
}

const AttachmentList = ({ storage }: AttachmentListProps) => {
  const { attachmentMap } = storage
  const { popup } = useContextMenu()
  const { messageBox } = useDialog()
  const { removeAttachment } = useDb()

  return (
    <ListContainer>
      {useMemo(() => {
        return (Object.values(attachmentMap) as Attachment[]).map(
          attachment => {
            return (
              <ListItem
                key={attachment!.name}
                style={{
                  backgroundImage: `url("${URL.createObjectURL(
                    attachment!.blob
                  )}")`
                }}
                onContextMenu={(event: React.MouseEvent) => {
                  event.preventDefault()

                  popup(event, [
                    // {
                    //   type: MenuTypes.Normal,
                    //   label: 'Copy Image Reference',
                    //   onClick: () => {
                    //     // TODO Clipboard
                    //   }
                    // },
                    {
                      type: MenuTypes.Normal,
                      label: 'Download',
                      onClick: () => {
                        downloadBlob(attachment.blob, attachment.name)
                      }
                    },
                    {
                      type: MenuTypes.Normal,
                      label: 'Remove Attachment',
                      onClick: () => {
                        messageBox({
                          title: `Remove Attachment`,
                          message:
                            'The attachment will be deleted permanently.',
                          iconType: DialogIconTypes.Warning,
                          buttons: ['Delete Attachment', 'Cancel'],
                          defaultButtonIndex: 0,
                          cancelButtonIndex: 1,
                          onClose: (value: number | null) => {
                            if (value === 0) {
                              removeAttachment(storage.id, attachment.name)
                            }
                          }
                        })
                      }
                    }
                  ])
                }}
              />
            )
          }
        )
      }, [attachmentMap, messageBox, popup, removeAttachment, storage])}
    </ListContainer>
  )
}

export default AttachmentList
