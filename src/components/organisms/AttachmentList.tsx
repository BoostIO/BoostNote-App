import React, { useMemo, useState, useEffect } from 'react'
import { NoteStorage, Attachment, AttachmentData } from '../../lib/db/types'
import { values } from '../../lib/db/utils'
import { downloadBlob } from '../../lib/download'
import { openNew } from '../../lib/platform'
import { openContextMenu } from '../../lib/electronOnly'
import copy from 'copy-to-clipboard'
import styled from '../../shared/lib/styled'
import { useLocalUI } from '../../lib/v2/hooks/local/useLocalUI'

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
  workspaceId: string
  attachment: Attachment
}

const AttachmentListItem = ({
  workspaceId,
  attachment,
}: AttachmentListItemProps) => {
  const { removeAttachment } = useLocalUI()
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
            {
              type: 'normal',
              label: 'Remove Attachment',
              click: () => removeAttachment(workspaceId, attachment.name),
            },
          ],
        })
      }}
    />
  )
}
interface AttachmentListProps {
  workspace: NoteStorage
}

const AttachmentList = ({ workspace }: AttachmentListProps) => {
  const { attachmentMap } = workspace

  return (
    <ListContainer>
      {useMemo(() => {
        return values(attachmentMap).map((attachment) => {
          return (
            <AttachmentListItem
              workspaceId={workspace.id}
              attachment={attachment}
              key={attachment.name}
            />
          )
        })
      }, [attachmentMap, workspace])}
    </ListContainer>
  )
}

export default AttachmentList
