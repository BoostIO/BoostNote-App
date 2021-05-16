import React, { useMemo, useCallback } from 'react'
import { Thread } from '../../interfaces/db/comments'
import {
  mdiTrashCanOutline,
  mdiAlertCircleOutline,
  mdiAlertCircleCheckOutline,
  mdiChevronDown,
} from '@mdi/js'
import Icon from '../../../shared/components/atoms/Icon'
import styled from '../../../shared/lib/styled'
import Button from '../../../shared/components/atoms/Button'
import { capitalize } from '../../lib/utils/string'
import {
  useContextMenu,
  MenuTypes,
  MenuItem,
} from '../../../shared/lib/stores/contextMenu'
import Flexbox from '../atoms/Flexbox'

interface ThreadActionButtonProps {
  thread: Thread
  onClose: (thread: Thread) => any
  onOpen: (thread: Thread) => any
  onDelete: (thread: Thread) => any
}

function ThreadActionButton({
  thread,
  onClose,
  onOpen,
  onDelete,
}: ThreadActionButtonProps) {
  const { popup } = useContextMenu()

  const actions: MenuItem[] = useMemo(() => {
    if (thread.status.type === 'outdated') {
      return []
    }

    return thread.status.type === 'closed'
      ? [
          {
            icon: <SuccessIcon path={mdiAlertCircleOutline} />,
            type: MenuTypes.Normal,
            label: 'Open',
            onClick: () => onOpen(thread),
          },
        ]
      : [
          {
            icon: <WarningIcon path={mdiAlertCircleCheckOutline} />,
            type: MenuTypes.Normal,
            label: 'Close',
            onClick: () => onClose(thread),
          },
        ]
  }, [thread, onClose, onOpen])

  const openActionMenu: React.MouseEventHandler<HTMLButtonElement> = useCallback(
    (event) => {
      event.preventDefault()
      popup(event, [
        ...actions,
        {
          icon: mdiTrashCanOutline,
          type: MenuTypes.Normal,
          label: 'Delete',
          onClick: () => onDelete(thread),
        },
      ])
    },
    [thread, onDelete, popup, actions]
  )

  const [variant, iconPath] = useMemo(() => {
    switch (thread.status.type) {
      case 'open':
        return ['success' as const, mdiAlertCircleOutline]
      case 'closed':
        return ['danger' as const, mdiAlertCircleCheckOutline]
      case 'outdated':
        return ['secondary' as const, mdiAlertCircleCheckOutline]
    }
  }, [thread.status.type])

  return (
    <Button iconPath={iconPath} variant={variant} onClick={openActionMenu}>
      <Flexbox alignItems='center'>
        {capitalize(thread.status.type)}
        <Icon path={mdiChevronDown} />
      </Flexbox>
    </Button>
  )
}

const SuccessIcon = styled(Icon)`
  color: ${({ theme }) => theme.colors.variants.success.base};
`

const WarningIcon = styled(Icon)`
  color: ${({ theme }) => theme.colors.variants.danger.base};
`

export default ThreadActionButton
