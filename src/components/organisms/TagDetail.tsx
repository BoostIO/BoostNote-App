import React, { useMemo, ChangeEventHandler, useCallback } from 'react'
import { NoteStorage, NoteDoc } from '../../lib/db/types'
import PageContainer from '../atoms/PageContainer'
import FolderDetailListNoteItem from '../molecules/FolderDetailListNoteItem'
import { usePreferences } from '../../lib/preferences'
import NoteSortingOptionsFragment from '../molecules/NoteSortingOptionsFragment'
import { NoteSortingOptions } from '../../lib/sort'
import { mdiTag } from '@mdi/js'
import styled from '../../shared/lib/styled'
import Icon from '../../shared/components/atoms/Icon'
import {
  borderBottom,
  flexCenter,
  selectStyle,
} from '../../shared/lib/styled/styleFunctions'

interface TagDetailProps {
  storage: NoteStorage
  tagName: string
}

const TagDetail = ({ storage, tagName }: TagDetailProps) => {
  const { preferences, setPreferences } = usePreferences()
  const noteSorting = preferences['general.noteSorting']

  const notes = useMemo(() => {
    const tag = storage.tagMap[tagName]
    if (tag == null) {
      return []
    }

    return [...tag.noteIdSet]
      .reduce((notes, noteId) => {
        const note = storage.noteMap[noteId]
        if (note != null && !note.trashed) {
          notes.push(note)
        }
        return notes
      }, [] as NoteDoc[])
      .sort((a, b) => {
        switch (noteSorting) {
          case 'created-date-asc':
            return a.createdAt.localeCompare(b.createdAt)
          case 'created-date-dsc':
            return -a.createdAt.localeCompare(b.createdAt)
          case 'title-asc':
            if (a.title.trim() === '' && b.title.trim() !== '') {
              return 1
            }
            if (b.title.trim() === '' && a.title.trim() !== '') {
              return -1
            }
            return a.title.localeCompare(b.title)
          case 'title-dsc':
            if (a.title.trim() === '' && b.title.trim() !== '') {
              return 1
            }
            if (b.title.trim() === '' && a.title.trim() !== '') {
              return -1
            }
            return -a.title.localeCompare(b.title)
          case 'updated-date-asc':
            return a.updatedAt.localeCompare(b.updatedAt)
          case 'updated-date-dsc':
          default:
            return -a.updatedAt.localeCompare(b.updatedAt)
        }
      })
  }, [storage, tagName, noteSorting])

  const selectNoteSorting: ChangeEventHandler<HTMLSelectElement> = useCallback(
    (event) => {
      setPreferences({
        'general.noteSorting': event.target.value as NoteSortingOptions,
      })
    },
    [setPreferences]
  )

  return (
    <PageContainer>
      <Header>
        <div className='icon'>
          <Icon path={mdiTag} />
        </div>
        {tagName}
      </Header>
      <Control>
        <div className='left' />
        <div className='right'>
          <select onChange={selectNoteSorting} value={noteSorting}>
            {<NoteSortingOptionsFragment />}
          </select>
        </div>
      </Control>
      <List>
        {notes.map((note) => {
          return (
            <FolderDetailListNoteItem
              key={note._id}
              storageId={storage.id}
              note={note}
            />
          )
        })}
      </List>
    </PageContainer>
  )
}

export default TagDetail

const Header = styled.h1`
  display: flex;
  align-items: center;
  .icon {
    font-size: 25px;
    width: 25px;
    height: 25px;
    ${flexCenter};
    margin-right: 4px;
  }
`

const Control = styled.div`
  display: flex;
  height: 40px;
  ${borderBottom}
  .left {
    flex: 1;
  }
  .right {
    display: flex;
    align-items: center;

    select {
      ${selectStyle};
      width: 120px;
      height: 25px;
      margin-bottom: 10px;
      font-size: 14px;
    }
  }
`

const List = styled.ul`
  padding: 0;
  list-style: none;
  margin: 0;
`
