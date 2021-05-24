import React, { useMemo, useCallback } from 'react'
import { Thread } from '../../interfaces/db/comments'
import { mdiChevronDown } from '@mdi/js'
import Icon from '../../../shared/components/atoms/Icon'
import { capitalize } from '../../lib/utils/string'
import { useContextMenu } from '../../../shared/lib/stores/contextMenu'
import Flexbox from '../atoms/Flexbox'
import useThreadActions from '../../../shared/lib/hooks/useThreadMenuActions'
import { getStatusIcon } from '../../../shared/lib/utils/comments'
import { RoundButton } from '../../../shared/components/atoms/Button'

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

  const [variant, iconPath] = useMemo(() => getStatusIcon(thread.status.type), [
    thread.status.type,
  ])

  return (
    <RoundButton iconPath={iconPath} variant={variant} onClick={openActionMenu}>
      <Flexbox alignItems='center'>
        {capitalize(thread.status.type)}
        <Icon path={mdiChevronDown} />
      </Flexbox>
    </RoundButton>
  )
}

export default ThreadActionButton
