import React, { useMemo } from 'react'
import {
  mdiTagMultiple,
  // mdiTag,
  mdiTagOutline
} from '@mdi/js'
import SideNavigatorItem from './SideNavigatorItem'
import { NoteStorage } from '../../lib/db/types'
import { useGeneralStatus } from '../../lib/generalStatus'
import { getTagListItemId } from '../../lib/nav'

interface TagListFragmentProps {
  storage: NoteStorage
}

const TagListFragment = ({ storage }: TagListFragmentProps) => {
  const { toggleSideNavOpenedItem, sideNavOpenedItemSet } = useGeneralStatus()
  const { id: storageId, tagMap } = storage

  const tagListNavItemId = getTagListItemId(storage.id)
  const tagListIsFolded = !sideNavOpenedItemSet.has(tagListNavItemId)

  const tagList = useMemo(() => {
    return Object.keys(tagMap).map(tagName => {
      return (
        <SideNavigatorItem
          key={`storage:${storageId}/tags:${tagName}`}
          depth={2}
          iconPath={mdiTagOutline}
          label={tagName}
        />
      )
    })
  }, [storageId, tagMap])

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
