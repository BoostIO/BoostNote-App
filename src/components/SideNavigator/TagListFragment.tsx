import React, { useMemo } from 'react'
import { mdiTagMultiple, mdiTag, mdiTagOutline } from '@mdi/js'
import SideNavigatorItem from './SideNavigatorItem'
import { NoteStorage } from '../../lib/db/types'
import { useGeneralStatus } from '../../lib/generalStatus'
import { getTagListItemId } from '../../lib/nav'
import { useRouter, usePathnameWithoutNoteId } from '../../lib/router'

interface TagListFragmentProps {
  storage: NoteStorage
}

const TagListFragment = ({ storage }: TagListFragmentProps) => {
  const { toggleSideNavOpenedItem, sideNavOpenedItemSet } = useGeneralStatus()
  const { id: storageId, tagMap } = storage
  const { push } = useRouter()
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
          iconPath={tagIsActive ? mdiTag : mdiTagOutline}
          label={tagName}
          onClick={() => {
            push(tagPathname)
          }}
          active={tagIsActive}
        />
      )
    })
  }, [storageId, tagMap, push, currentPathname])

  return (
    <>
      <SideNavigatorItem
        depth={1}
        iconPath={mdiTagMultiple}
        label='Tags'
        folded={tagListIsFolded}
        onFoldButtonClick={() => {
          toggleSideNavOpenedItem(tagListNavItemId)
        }}
      />
      {!tagListIsFolded && tagList}
    </>
  )
}

export default TagListFragment
