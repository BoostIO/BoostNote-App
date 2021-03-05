import React, { useState, useCallback, useMemo } from 'react'
import { SerializedFolderWithBookmark } from '../../../../interfaces/db/folder'
import { SerializedTeam } from '../../../../interfaces/db/team'
import ContentManagerRow from './ContentManagerRow'
import {
  mdiFolderOutline,
  mdiStar,
  mdiStarOutline,
  mdiFolderMoveOutline,
  mdiTrashCanOutline,
} from '@mdi/js'
import FolderLink from '../../../atoms/Link/FolderLink'
import ContentManagerRowLinkContent from './ContentManagerRowLinkContent'
import { useNav } from '../../../../lib/stores/nav'
import { useToast } from '../../../../lib/stores/toast'
import {
  CreateFolderBookmarkResponseBody,
  DestroyFolderBookmarkResponseBody,
  destroyFolderBookmark,
  createFolderBookmark,
} from '../../../../api/teams/folders/bookmarks'
import RowAction, { ContentManagerRowAction } from '../Actions/RowAction'
import Flexbox from '../../../atoms/Flexbox'
import { getFolderId } from '../../../../lib/utils/patterns'
import MoveItemModal from '../../../organisms/Modal/contents/Forms/MoveItemModal'
import { useModal } from '../../../../lib/stores/modal'

interface ContentManagerFolderRowProps {
  team: SerializedTeam
  folder: SerializedFolderWithBookmark
  updating: boolean
  setUpdating: React.Dispatch<React.SetStateAction<string[]>>
  checked?: boolean
  onSelect: (val: boolean) => void
}

enum ActionsIds {
  Bookmark = 0,
  Move = 1,
  Delete = 2,
}

const ContentmanagerFolderRow = ({
  team,
  folder,
  checked,
  updating,
  setUpdating,
  onSelect,
}: ContentManagerFolderRowProps) => {
  const [sending, setSending] = useState<ActionsIds>()
  const {
    updateFoldersMap,
    deleteFolderHandler,
    updateFolderHandler,
  } = useNav()
  const { pushMessage, pushApiErrorMessage: pushAxiosErrorMessage } = useToast()
  const { openModal } = useModal()

  const toggleFolderBookmark = useCallback(
    async (folder: SerializedFolderWithBookmark) => {
      if (updating) {
        return
      }
      const patternedId = getFolderId(folder)
      setUpdating((prev) => [...prev, patternedId])
      setSending(ActionsIds.Bookmark)
      try {
        let data:
          | CreateFolderBookmarkResponseBody
          | DestroyFolderBookmarkResponseBody
        if (folder.bookmarked) {
          data = await destroyFolderBookmark(team.id, folder.id)
        } else {
          data = await createFolderBookmark(team.id, folder.id)
        }
        updateFoldersMap([data.folder.id, data.folder])
      } catch (error) {
        pushMessage({
          title: 'Error',
          description: 'Could not alter bookmark for this folder',
        })
      }
      setSending(undefined)
      setUpdating((prev) => prev.filter((id) => id !== patternedId))
    },
    [team, setSending, pushMessage, updateFoldersMap, updating, setUpdating]
  )

  const trashFolder = useCallback(
    async (folder: SerializedFolderWithBookmark) => {
      if (updating) {
        return
      }
      const patternedId = getFolderId(folder)
      setUpdating((prev) => [...prev, patternedId])
      setSending(ActionsIds.Delete)
      await deleteFolderHandler(folder)
      setSending(undefined)
      setUpdating((prev) => prev.filter((id) => id !== patternedId))
    },
    [deleteFolderHandler, updating, setUpdating]
  )

  const moveFolder = useCallback(
    async (
      folder: SerializedFolderWithBookmark,
      workspaceId: string,
      parentFolderId?: string
    ) => {
      if (updating) {
        return
      }
      const patternedId = getFolderId(folder)
      setUpdating((prev) => [...prev, patternedId])
      setSending(ActionsIds.Move)
      try {
        await updateFolderHandler(folder, {
          workspaceId,
          parentFolderId,
          emoji: 'unchanged',
        })
      } catch (error) {
        pushAxiosErrorMessage(error)
      }
      setSending(undefined)
      setUpdating((prev) => prev.filter((id) => id !== patternedId))
    },
    [updateFolderHandler, updating, setUpdating, pushAxiosErrorMessage]
  )

  const openMoveForm = useCallback(
    (folder: SerializedFolderWithBookmark) => {
      openModal(
        <MoveItemModal
          onSubmit={(workspaceId, parentFolderId) =>
            moveFolder(folder, workspaceId, parentFolderId)
          }
        />
      )
    },
    [openModal, moveFolder]
  )

  const actions = useMemo(() => {
    const actions: ContentManagerRowAction<SerializedFolderWithBookmark>[] = []

    actions.push(
      folder.bookmarked
        ? {
            iconPath: mdiStar,
            id: ActionsIds.Bookmark,
            tooltip: 'Unbookmark',
            onClick: () => toggleFolderBookmark(folder),
          }
        : {
            iconPath: mdiStarOutline,
            id: ActionsIds.Bookmark,
            tooltip: 'Bookmark',
            onClick: () => toggleFolderBookmark(folder),
          }
    )

    actions.push({
      iconPath: mdiFolderMoveOutline,
      id: ActionsIds.Move,
      tooltip: 'Move',
      onClick: () => openMoveForm(folder),
    })

    actions.push({
      iconPath: mdiTrashCanOutline,
      id: ActionsIds.Delete,
      tooltip: 'Delete',
      onClick: () => trashFolder(folder),
    })

    return actions
  }, [folder, toggleFolderBookmark, trashFolder, openMoveForm])

  return (
    <ContentManagerRow
      checked={checked}
      onSelect={onSelect}
      itemLink={
        <FolderLink folder={folder} team={team}>
          <ContentManagerRowLinkContent
            label={folder.name}
            defaultIcon={mdiFolderOutline}
            emoji={folder.emoji}
            date={folder.updatedAt}
          />
        </FolderLink>
      }
      rowActions={
        <Flexbox flex='0 0 auto' className='actions'>
          {actions.map((action) => (
            <RowAction
              action={action}
              item={folder}
              key={`${action.id}`}
              sending={action.id === sending}
              disabled={updating}
            />
          ))}
        </Flexbox>
      }
    />
  )
}

export default ContentmanagerFolderRow
