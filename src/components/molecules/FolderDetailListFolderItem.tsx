import React, { useCallback } from 'react'
import FolderDetailListItem from './FolderDetailListItem'
import { mdiFolder } from '@mdi/js'
import { PopulatedFolderDoc } from '../../lib/db/types'
import { useRouter } from '../../lib/router'
import { getFolderNameFromPathname } from '../../lib/db/utils'

interface FolderDetailListFolderItemProps {
  storageId: string
  folder: PopulatedFolderDoc
}

const FolderDetailListFolderItem = ({
  storageId,
  folder,
}: FolderDetailListFolderItemProps) => {
  const { push } = useRouter()

  const navigateToFolder = useCallback(() => {
    push(`/app/storages/${storageId}/notes${folder.pathname}`)
  }, [push, storageId, folder.pathname])

  return (
    <FolderDetailListItem
      iconPath={mdiFolder}
      label={getFolderNameFromPathname(folder.pathname) || ''}
      onClick={navigateToFolder}
    />
  )
}

export default FolderDetailListFolderItem
