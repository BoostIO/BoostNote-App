import React from 'react'
import { Link } from '../../../lib/router'
import styled from '../../../lib/styled/styled'
import { NoteDoc } from '../../../lib/db/types'

const StyledNoteListItem = styled.div<{ active: boolean }>`
  ${props => props.active && `background-color: #006FCC;`}
  .untitled {
    color: grey;
  }
`

type NoteItemProps = {
  note: NoteDoc
  active: boolean
}

export default ({ note, active }: NoteItemProps) => {
  const noteHash = `#${note._id}`

  return (
    <StyledNoteListItem active={active}>
      <Link href={noteHash}>
        {note.title.length > 0 ? (
          <div>{note.title}</div>
        ) : (
          <div className='untitled'>Untitled</div>
        )}
      </Link>
    </StyledNoteListItem>
  )
}
