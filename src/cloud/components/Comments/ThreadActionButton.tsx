import React, { useMemo, useCallback } from 'react'
import { Thread } from '../../interfaces/db/comments'
import {
  mdiChevronDown,
  mdiAlertCircleOutline,
  mdiAlertCircleCheckOutline,
} from '@mdi/js'
import Icon from '../../../design/components/atoms/Icon'
import { capitalize } from '../../lib/utils/string'
import { useContextMenu } from '../../../design/lib/stores/contextMenu'
import useThreadActions from '../../lib/hooks/useThreadMenuActions'
import { RoundButton } from '../../../design/components/atoms/Button'
import { useI18n } from '../../lib/hooks/useI18n'
import Flexbox from '../../../design/components/atoms/Flexbox'

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
  const { getThreadStatusLabel } = useI18n()

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
    <RoundButton iconPath={iconPath} variant={variant} onClick={openActionMenu}>
      <Flexbox alignItems='center'>
        {capitalize(getThreadStatusLabel(thread.status.type))}
        <Icon path={mdiChevronDown} />
      </Flexbox>
    </RoundButton>
  )
}

export default ThreadActionButton
