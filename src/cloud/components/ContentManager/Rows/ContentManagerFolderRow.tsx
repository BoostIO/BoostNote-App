import React, { useMemo } from 'react'
import { SerializedFolderWithBookmark } from '../../../interfaces/db/folder'
import { SerializedTeam } from '../../../interfaces/db/team'
import ContentManagerRow from './ContentManagerRow'
import { getFolderHref } from '../../Link/FolderLink'
import ContentManagerCell from '../ContentManagerCell'
import { useNav } from '../../../lib/stores/nav'
import { useTranslation } from 'react-i18next'
import { lngKeys } from '../../../lib/i18n/types'
import { useRouter } from '../../../lib/router'
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
  const { t } = useTranslation()
  const { docsMap, foldersMap } = useNav()
  const { push } = useRouter()

  const childrenDocs = useMemo(() => {
    return [...docsMap.values()].filter(
      (doc) => doc.parentFolderId === folder.id
    ).length
  }, [docsMap, folder.id])

  const childrenFolders = useMemo(() => {
    return [...foldersMap.values()].filter(
      (f) => f.parentFolderId === folder.id
    ).length
  }, [foldersMap, folder.id])

  const href = getFolderHref(folder, team, 'index')
  return (
    <ContentManagerRow
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
    >
      <ContentManagerCell>
        {childrenFolders} {t(lngKeys.GeneralFolders).toLocaleLowerCase()}{' '}
      </ContentManagerCell>
      <ContentManagerCell>
        {childrenDocs} {t(lngKeys.GeneralDocuments).toLocaleLowerCase()}
      </ContentManagerCell>
    </ContentManagerRow>
  )
}

export default React.memo(ContentmanagerFolderRow)
