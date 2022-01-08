import React, { useMemo } from 'react'
import { Thread } from '../../interfaces/db/comments'
import Icon from '../../../design/components/atoms/Icon'
import { MenuItem, MenuTypes } from '../../../design/lib/stores/contextMenu'
import { mdiTrashCanOutline } from '@mdi/js'
import { useI18n } from './useI18n'
import { lngKeys } from '../i18n/types'

export interface ThreadActionProps {
  thread: Thread
  onDelete: (thread: Thread) => any
}

function useThreadActions({ thread, onDelete }: ThreadActionProps) {
  const { translate } = useI18n()
  const actions: MenuItem[] = useMemo(() => {
    const deleteAction: MenuItem = {
      icon: <Icon path={mdiTrashCanOutline} />,
      type: MenuTypes.Normal,
      label: translate(lngKeys.GeneralDelete),
      onClick: () => onDelete(thread),
    }

    return [deleteAction]
  }, [onDelete, thread, translate])
  return actions
}

export default useThreadActions
