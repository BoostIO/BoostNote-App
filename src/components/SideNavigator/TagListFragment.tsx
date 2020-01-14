import React, { useMemo } from 'react'
import SideNavigatorItem from './SideNavigatorItem'
import { NoteStorage } from '../../lib/db/types'
import { useGeneralStatus } from '../../lib/generalStatus'
import { getTagListItemId } from '../../lib/nav'
import { useRouter, usePathnameWithoutNoteId } from '../../lib/router'
import { useContextMenu, MenuTypes } from '../../lib/contextMenu'
import { useDialog, DialogIconTypes } from '../../lib/dialog'
import { useDb } from '../../lib/db'
import { IconTag, IconTags, IconTagFill } from '../icons'
import { useTranslation } from 'react-i18next'

interface TagListFragmentProps {
  storage: NoteStorage
}

const TagListFragment = ({ storage }: TagListFragmentProps) => {
  const { toggleSideNavOpenedItem, sideNavOpenedItemSet } = useGeneralStatus()
  const { id: storageId, tagMap } = storage
  const { push } = useRouter()
  const { popup } = useContextMenu()
  const { messageBox } = useDialog()
  const { removeTag } = useDb()
  const { t } = useTranslation()
  const currentPathname = usePathnameWithoutNoteId()

  const tagListNavItemId = getTagListItemId(storage.id)
  const tagListIsFolded = !sideNavOpenedItemSet.has(tagListNavItemId)

  const tagList = useMemo(() => {
    return Object.keys(tagMap).map(tagName => {
      const tagPathname = `/app/storages/${storageId}/tags/${tagName}`
      const tagIsActive = currentPathname === tagPathname
      return (
        <SideNavigatorItem
          key={`storage:${storageId}/tags:${tagName}`}
          depth={2}
          icon={tagIsActive ? <IconTagFill size='1.4em' /> : <IconTag />}
          label={tagName}
          onClick={() => {
            push(tagPathname)
          }}
          active={tagIsActive}
          onContextMenu={event => {
            event.preventDefault()
            popup(event, [
              {
                type: MenuTypes.Normal,
                label: t('tag.remove'),
                onClick: () => {
                  messageBox({
                    title: `Remove "${tagName}" tag`,
                    message: t('tag.removeMessage'),
                    iconType: DialogIconTypes.Warning,
                    buttons: [t('tag.remove'), t('general.cancel')],
                    defaultButtonIndex: 0,
                    cancelButtonIndex: 1,
                    onClose: (value: number | null) => {
                      if (value === 0) {
                        removeTag(storageId, tagName)
                      }
                    }
                  })
                }
              }
            ])
          }}
        />
      )
    })
  }, [
    storageId,
    tagMap,
    push,
    currentPathname,
    popup,
    messageBox,
    removeTag,
    t
  ])

  return (
    <>
      <SideNavigatorItem
        depth={1}
        icon={<IconTags size='1.5em' />}
        label={t('tag.tag')}
        folded={tagList.length > 0 ? tagListIsFolded : undefined}
        onFoldButtonClick={() => {
          toggleSideNavOpenedItem(tagListNavItemId)
        }}
        onClick={() => {
          toggleSideNavOpenedItem(tagListNavItemId)
        }}
        onContextMenu={event => {
          event.preventDefault()
        }}
      />
      {!tagListIsFolded && tagList}
    </>
  )
}

export default TagListFragment
