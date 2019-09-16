import React, { useMemo } from 'react'
import { Link } from '../../../lib/router'
import styled from '../../../lib/styled/styled'
import { NoteDoc } from '../../../lib/db/types'
import Icon from '../../atoms/Icon'
import { mdiTagOutline } from '@mdi/js'

const StyledNoteListItem = styled.div<{ active: boolean }>`
  margin: 0;
  ${({ active, theme }) =>
    active &&
    `background-color: ${theme.colors.active};
    color: ${theme.colors.inverseText};`}
  border-bottom: solid 1px ${({ theme }) => theme.colors.border};
  padding: 8px;

  a {
    text-decoration: none;
  }

  .title {
    font-weight: bold;
    font-size: 14px;
    margin-bottom: 4px;
  }

  .preview {
    color: ${({ active, theme }) =>
      active ? theme.colors.inverseText : theme.colors.deemedText};
  }
`

type NoteItemProps = {
  note: NoteDoc
  active: boolean
  storageId: string
}

export default ({ note, active, storageId }: NoteItemProps) => {
  const href = `/storages/${storageId}/notes${
    note.folderPathname === '/' ? '' : note.folderPathname
  }/${note._id}`

  const contentPreview = useMemo(
    () => {
      return (
        note.content
          .trim()
          .split('\n')
          .shift() || 'Empty note'
      )
    },
    [note.content]
  )

  return (
    <StyledNoteListItem active={active}>
      <Link href={href}>
        <div className='title'>{note.title}</div>
        <div className='preview'>{contentPreview}</div>
        {note.tags.length > 0 && (
          <div>
            <Icon path={mdiTagOutline} />{' '}
            {note.tags.map(tag => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        )}
      </Link>
    </StyledNoteListItem>
  )
}
