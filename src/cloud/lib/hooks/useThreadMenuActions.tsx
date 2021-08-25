import React, { useMemo } from 'react'
import { Thread } from '../../interfaces/db/comments'
import Icon from '../../../design/components/atoms/Icon'
import styled from '../../../design/lib/styled'
import { MenuItem, MenuTypes } from '../../../design/lib/stores/contextMenu'
import {
  mdiAlertCircleOutline,
  mdiAlertCircleCheckOutline,
  mdiTrashCanOutline,
} from '@mdi/js'
import { useI18n } from './useI18n'
import { lngKeys } from '../i18n/types'

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
  const { translate } = useI18n()
  const actions: MenuItem[] = useMemo(() => {
    const deleteAction: MenuItem = {
      icon: <Icon path={mdiTrashCanOutline} />,
      type: MenuTypes.Normal,
      label: translate(lngKeys.GeneralDelete),
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
            label: translate(lngKeys.GeneralOpenVerb),
            onClick: () => onOpen(thread),
          },
          deleteAction,
        ]
      : [
          {
            icon: <WarningIcon path={mdiAlertCircleCheckOutline} />,
            type: MenuTypes.Normal,
            label: translate(lngKeys.GeneralCloseVerb),
            onClick: () => onClose(thread),
          },
          deleteAction,
        ]
  }, [thread, onClose, onOpen, onDelete, translate])

  return actions
}

const SuccessIcon = styled(Icon)`
  color: ${({ theme }) => theme.colors.variants.success.base};
`

const WarningIcon = styled(Icon)`
  color: ${({ theme }) => theme.colors.variants.danger.base};
`

export default useThreadActions
