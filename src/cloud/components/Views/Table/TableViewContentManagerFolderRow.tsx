import React, { useMemo } from 'react'
import { SerializedFolderWithBookmark } from '../../../interfaces/db/folder'
import { SerializedTeam } from '../../../interfaces/db/team'
import { getFolderHref } from '../../Link/FolderLink'
import { useRouter } from '../../../lib/router'
import TableViewContentManagerRow from './TableViewContentManagerRow'

interface ContentManagerFolderRowProps {
  team: SerializedTeam
  folder: SerializedFolderWithBookmark
  updating: boolean
  setUpdating: React.Dispatch<React.SetStateAction<string[]>>
  checked?: boolean
  onSelect: (val: boolean) => void
  currentUserIsCoreMember: boolean
  onDragStart: (event: any, folder: SerializedFolderWithBookmark) => void
  onDragEnd: (event: any) => void
  onDrop: (event: any, folder: SerializedFolderWithBookmark) => void
}

const ContentmanagerFolderRow = ({
  team,
  folder,
  checked,
  currentUserIsCoreMember,
  onSelect,
  onDragStart,
  onDragEnd,
  onDrop,
}: ContentManagerFolderRowProps) => {
  const { push } = useRouter()

  const href = useMemo(() => getFolderHref(folder, team, 'index'), [
    folder,
    team,
  ])

  return (
    <TableViewContentManagerRow
      checked={checked}
      onSelect={onSelect}
      showCheckbox={currentUserIsCoreMember}
      label={folder.name}
      emoji={folder.emoji}
      labelHref={href}
      labelOnclick={() => push(href)}
      onDragStart={(event: any) => onDragStart(event, folder)}
      onDragEnd={(event: any) => onDragEnd(event)}
      onDrop={(event: any) => onDrop(event, folder)}
    />
  )
}

export default React.memo(ContentmanagerFolderRow)
