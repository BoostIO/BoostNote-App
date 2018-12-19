import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { Note } from '../../../types'

const StyledNoteListItem = styled.div<{ active: boolean }>`
  ${props => props.active && `background-color: #006FCC;`}
  .untitled {
    color: grey;
  }
`

type NoteItemProps = {
  note: Note
  active: boolean
}

const NoteItem = ({ note, active }: NoteItemProps) => {
  const noteHash = `#${note._id}`

  return (
    <StyledNoteListItem active={active}>
      <Link to={noteHash}>
        {note.title.length > 0 ? (
          <div>{note.title}</div>
        ) : (
          <div className="untitled">Untitled</div>
        )}
      </Link>
    </StyledNoteListItem>
  )
}

export default NoteItem
