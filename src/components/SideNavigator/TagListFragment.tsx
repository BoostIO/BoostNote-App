import React from 'react'
import {
  mdiTagMultiple,
  // mdiTag,
  mdiTagOutline
} from '@mdi/js'
import SideNavigatorItem from './SideNavigatorItem'
import { NoteStorage } from '../../lib/db/types'

interface TagListFragmentProps {
  storage: NoteStorage
}

const TagListFragment = ({ storage }: TagListFragmentProps) => {
  const tagList = Object.keys(storage.tagMap).map(tagName => {
    return (
      <SideNavigatorItem
        key={`storage:${storage.id}/tags:${tagName}`}
        depth={2}
        iconPath={mdiTagOutline}
        label={tagName}
      />
    )
  })
  return (
    <>
      <SideNavigatorItem depth={1} iconPath={mdiTagMultiple} label='Tags' />
      {tagList}
    </>
  )
}

export default TagListFragment
