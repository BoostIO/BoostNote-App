import React from 'react'
import { Link, LinkProps } from 'react-router-dom'
import styled from 'styled-components'
import { Note } from '../../../types'

type NoteLinkProps = LinkProps & { active: boolean }

const NoteLink = styled<NoteLinkProps>(({ active, ...props }) => (
  <Link {...props} />
))`
  ${props =>
    props.active &&
    `color: white;
    background-color: blue;`}
`

type NoteItemProps = {
  note: Note
  active: boolean
}

const NoteItem = ({ note, active }: NoteItemProps) => {
  const noteHash = `#${note._id}`

  return (
    <li>
      <NoteLink active={active} to={noteHash}>
        {note._id}
      </NoteLink>
    </li>
  )
}

export default NoteItem
