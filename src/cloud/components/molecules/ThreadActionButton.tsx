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
import useThreadActions from '../../../shared/lib/hooks/useThreadMenuActions'

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
  const actions = useThreadActions({ thread, onClose, onOpen, onDelete })

  const openActionMenu: React.MouseEventHandler<HTMLButtonElement> = useCallback(
    (event) => {
      event.preventDefault()
      popup(event, actions)
    },
    [popup, actions]
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

export default ThreadActionButton
