import React, { useMemo, ChangeEventHandler, useCallback } from 'react'
import { NoteStorage } from '../../lib/db/types'
import PageContainer from '../atoms/PageContainer'
import FolderDetailListNoteItem from '../molecules/FolderDetailListNoteItem'
import { usePreferences } from '../../lib/preferences'
import NoteSortingOptionsFragment from '../molecules/NoteSortingOptionsFragment'
import { NoteSortingOptions } from '../../lib/sort'
import Icon from '../atoms/Icon'
import { mdiArchive } from '@mdi/js'
import { values } from '../../lib/db/utils'
import { useTranslation } from 'react-i18next'
import styled from '../../shared/lib/styled'
import {
  flexCenter,
  borderBottom,
  selectStyle,
} from '../../shared/lib/styled/styleFunctions'

interface TrashDetailProps {
  storage: NoteStorage
}

const ArchiveDetail = ({ storage }: TrashDetailProps) => {
  const { preferences, setPreferences } = usePreferences()
  const noteSorting = preferences['general.noteSorting']
  const { t } = useTranslation()

  const notes = useMemo(() => {
    return values(storage.noteMap)
      .filter((note) => note.trashed)
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
  }, [storage, noteSorting])

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
          <Icon path={mdiArchive} />
        </div>
        {t('general.archive')}
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

export default ArchiveDetail

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
