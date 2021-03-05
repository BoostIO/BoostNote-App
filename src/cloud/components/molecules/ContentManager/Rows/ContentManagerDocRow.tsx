import React, { useState, useMemo, useCallback } from 'react'
import { SerializedDocWithBookmark } from '../../../../interfaces/db/doc'
import { SerializedTeam } from '../../../../interfaces/db/team'
import ContentManagerRow from './ContentManagerRow'
import { getDocTitle, getDocId } from '../../../../lib/utils/patterns'
import {
  mdiCardTextOutline,
  mdiStarOutline,
  mdiStar,
  mdiArchiveOutline,
  mdiFileUndoOutline,
  mdiTrashCanOutline,
  mdiFolderMoveOutline,
} from '@mdi/js'
import DocLink from '../../../atoms/Link/DocLink'
import cc from 'classcat'
import ContentManagerRowLinkContent from './ContentManagerRowLinkContent'
import RowAction, { ContentManagerRowAction } from '../Actions/RowAction'
import {
  destroyDocBookmark,
  createDocBookmark,
  CreateDocBookmarkResponseBody,
  DestroyDocBookmarkResponseBody,
} from '../../../../api/teams/docs/bookmarks'
import { useNav } from '../../../../lib/stores/nav'
import { useToast } from '../../../../lib/stores/toast'
import Flexbox from '../../../atoms/Flexbox'
import { archiveDoc, unarchiveDoc } from '../../../../api/teams/docs'
import MoveItemModal from '../../../organisms/Modal/contents/Forms/MoveItemModal'
import { useModal } from '../../../../lib/stores/modal'
import { SerializedWorkspace } from '../../../../interfaces/db/workspace'
import { usePage } from '../../../../lib/stores/pageStore'
import { SerializedUser } from '../../../../interfaces/db/user'

interface ContentManagerDocRowProps {
  team: SerializedTeam
  doc: SerializedDocWithBookmark
  workspace?: SerializedWorkspace
  updating: boolean
  showPath?: boolean
  checked?: boolean
  onSelect: (val: boolean) => void
  setUpdating: React.Dispatch<React.SetStateAction<string[]>>
}

enum ActionsIds {
  Bookmark = 0,
  Move = 1,
  Archive = 2,
  Delete = 3,
}

const ContentmanagerDocRow = ({
  team,
  doc,
  checked,
  workspace,
  updating,
  showPath,
  setUpdating,
  onSelect,
}: ContentManagerDocRowProps) => {
  const [sending, setSending] = useState<ActionsIds>()
  const { updateDocsMap, deleteDocHandler, updateDocHandler } = useNav()
  const { pushMessage, pushApiErrorMessage } = useToast()
  const { openModal } = useModal()
  const { permissions = [] } = usePage()

  const fullPath = useMemo(() => {
    if (!showPath) {
      return
    }

    if (workspace == null) {
      return doc.folderPathname
    }

    return `/${workspace.name}${doc.folderPathname}`
  }, [showPath, doc, workspace])

  const toggleDocBookmark = useCallback(
    async (doc: SerializedDocWithBookmark) => {
      if (updating) {
        return
      }
      const patternedId = getDocId(doc)
      setUpdating((prev) => [...prev, patternedId])
      setSending(ActionsIds.Bookmark)
      try {
        let data: CreateDocBookmarkResponseBody | DestroyDocBookmarkResponseBody
        if (doc.bookmarked) {
          data = await destroyDocBookmark(team.id, doc.id)
        } else {
          data = await createDocBookmark(team.id, doc.id)
        }
        updateDocsMap([data.doc.id, data.doc])
      } catch (error) {
        pushMessage({
          title: 'Error',
          description: 'Could not alter bookmark for this doc',
        })
      }
      setSending(undefined)
      setUpdating((prev) => prev.filter((id) => id !== patternedId))
    },
    [team, pushMessage, updateDocsMap, updating, setUpdating]
  )

  const toggleArchived = useCallback(
    async (doc: SerializedDocWithBookmark) => {
      if (updating) {
        return
      }
      const patternedId = getDocId(doc)
      setUpdating((prev) => [...prev, patternedId])
      setSending(ActionsIds.Archive)
      try {
        const data =
          doc.archivedAt == null
            ? await archiveDoc(doc.teamId, doc.id)
            : await unarchiveDoc(doc.teamId, doc.id)
        updateDocsMap([data.doc.id, data.doc])
      } catch (error) {
        pushMessage({
          title: 'Error',
          description: 'Could not alter archive for this doc',
        })
      }
      setSending(undefined)
      setUpdating((prev) => prev.filter((id) => id !== patternedId))
    },
    [pushMessage, updateDocsMap, updating, setUpdating]
  )

  const deleteDoc = useCallback(
    async (doc: SerializedDocWithBookmark) => {
      if (updating) {
        return
      }
      const patternedId = getDocId(doc)
      setUpdating((prev) => [...prev, patternedId])
      setSending(ActionsIds.Delete)
      await deleteDocHandler(doc)
      setSending(undefined)
      setUpdating((prev) => prev.filter((id) => id !== patternedId))
    },
    [deleteDocHandler, updating, setUpdating]
  )

  const moveDoc = useCallback(
    async (
      doc: SerializedDocWithBookmark,
      workspaceId: string,
      parentFolderId?: string
    ) => {
      if (updating) {
        return
      }
      const patternedId = getDocId(doc)
      setUpdating((prev) => [...prev, patternedId])
      setSending(ActionsIds.Move)
      try {
        await updateDocHandler(doc, { workspaceId, parentFolderId })
      } catch (error) {
        pushApiErrorMessage(error)
      }
      setSending(undefined)
      setUpdating((prev) => prev.filter((id) => id !== patternedId))
    },
    [updateDocHandler, updating, setUpdating, pushApiErrorMessage]
  )

  const openMoveForm = useCallback(
    (doc: SerializedDocWithBookmark) => {
      openModal(
        <MoveItemModal
          onSubmit={(workspaceId, parentFolderId) =>
            moveDoc(doc, workspaceId, parentFolderId)
          }
        />
      )
    },
    [openModal, moveDoc]
  )

  const actions = useMemo(() => {
    const actions: ContentManagerRowAction<SerializedDocWithBookmark>[] = []

    actions.push(
      doc.bookmarked
        ? {
            iconPath: mdiStar,
            id: ActionsIds.Bookmark,
            tooltip: 'Unbookmark',
            onClick: () => toggleDocBookmark(doc),
          }
        : {
            iconPath: mdiStarOutline,
            id: ActionsIds.Bookmark,
            tooltip: 'Bookmark',
            onClick: () => toggleDocBookmark(doc),
          }
    )

    if (doc.archivedAt == null) {
      actions.push({
        iconPath: mdiFolderMoveOutline,
        id: ActionsIds.Move,
        tooltip: 'Move',
        onClick: () => openMoveForm(doc),
      })
    }

    actions.push(
      doc.archivedAt == null
        ? {
            iconPath: mdiArchiveOutline,
            id: ActionsIds.Archive,
            tooltip: 'Archive',
            onClick: () => toggleArchived(doc),
          }
        : {
            iconPath: mdiFileUndoOutline,
            id: ActionsIds.Archive,
            tooltip: 'Unarchive',
            onClick: () => toggleArchived(doc),
          }
    )

    if (doc.archivedAt != null) {
      actions.push({
        iconPath: mdiTrashCanOutline,
        id: ActionsIds.Delete,
        tooltip: 'Delete permanently',
        onClick: () => deleteDoc(doc),
      })
    }

    return actions
  }, [doc, toggleDocBookmark, toggleArchived, deleteDoc, openMoveForm])

  const editors = useMemo(() => {
    if (
      permissions.length === 0 ||
      doc.head == null ||
      doc.head.creators == null ||
      doc.head.creators.length === 0
    ) {
      return undefined
    }

    const usersMap = permissions.reduce((acc, val) => {
      acc.set(val.user.id, val.user)
      return acc
    }, new Map<string, SerializedUser>())

    return doc.head.creators.reduce((acc, val) => {
      let user
      if (typeof val === 'string') {
        user = usersMap.get(val)
      } else {
        user = usersMap.get(val.id)
      }

      if (user != null) {
        acc.push(user)
      }

      return acc
    }, [] as SerializedUser[])
  }, [permissions, doc])
  return (
    <ContentManagerRow
      checked={checked}
      onSelect={onSelect}
      itemLink={
        <DocLink doc={doc} team={team}>
          <ContentManagerRowLinkContent
            label={
              doc.archivedAt != null
                ? `( Archived ) ${getDocTitle(doc, 'Untitled')}`
                : getDocTitle(doc, 'Untitled')
            }
            defaultIcon={mdiCardTextOutline}
            emoji={doc.emoji}
            date={doc.updatedAt}
            path={fullPath}
            editors={editors}
          />
        </DocLink>
      }
      className={cc([
        doc.archivedAt != null && 'archived',
        showPath && 'expanded',
      ])}
      rowActions={
        <Flexbox flex='0 0 auto' className='actions'>
          {actions.map((action) => (
            <RowAction
              action={action}
              item={doc}
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

export default ContentmanagerDocRow
