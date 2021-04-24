import { SidebarSpace } from '../../../../shared/components/organisms/Sidebar/molecules/SidebarSpaces'
import React from 'react'
import { NoteStorage } from '../../../db/types'
import { getWorkspaceHref } from '../../../db/utils'

export function mapStorages(
  push: (url: string) => void,
  storages: NoteStorage[],
  currentStorage: NoteStorage
) {
  const rows: SidebarSpace[] = []
  storages.forEach((storage) => {
    const href = getWorkspaceHref(storage)
    rows.push({
      label: storage.name,
      active: currentStorage?.id === storage.id,
      linkProps: {
        href,
        onClick: (event: React.MouseEvent) => {
          event.preventDefault()
          push(href)
        },
      },
    })
  })

  return rows
}
