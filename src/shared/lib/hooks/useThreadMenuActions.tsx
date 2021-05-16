import React, { useMemo } from 'react'
import { Thread } from '../../../cloud/interfaces/db/comments'
import Icon from '../../components/atoms/Icon'
import styled from '../styled'
import { MenuItem, MenuTypes } from '../stores/contextMenu'
import {
  mdiAlertCircleOutline,
  mdiAlertCircleCheckOutline,
  mdiTrashCanOutline,
} from '@mdi/js'

export interface ThreadActionProps {
  thread: Thread
  onClose: (thread: Thread) => any
  onOpen: (thread: Thread) => any
  onDelete: (thread: Thread) => any
}

function useThreadActions({
  thread,
  onClose,
  onOpen,
  onDelete,
}: ThreadActionProps) {
  const actions: MenuItem[] = useMemo(() => {
    const deleteAction: MenuItem = {
      icon: mdiTrashCanOutline,
      type: MenuTypes.Normal,
      label: 'Delete',
      onClick: () => onDelete(thread),
    }

    if (thread.status.type === 'outdated') {
      return [deleteAction]
    }

    return thread.status.type === 'closed'
      ? [
          {
            icon: <SuccessIcon path={mdiAlertCircleOutline} />,
            type: MenuTypes.Normal,
            label: 'Open',
            onClick: () => onOpen(thread),
          },
          deleteAction,
        ]
      : [
          {
            icon: <WarningIcon path={mdiAlertCircleCheckOutline} />,
            type: MenuTypes.Normal,
            label: 'Close',
            onClick: () => onClose(thread),
          },
          deleteAction,
        ]
  }, [thread, onClose, onOpen, onDelete])

  return actions
}

const SuccessIcon = styled(Icon)`
  color: ${({ theme }) => theme.colors.variants.success.base};
`

const WarningIcon = styled(Icon)`
  color: ${({ theme }) => theme.colors.variants.danger.base};
`

export default useThreadActions
