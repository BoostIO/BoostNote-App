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
  hash: string
  note: Note
}

const NoteItem = ({ note, hash }: NoteItemProps) => {
  const noteHash = `#${note._id}`
  const noteIsActive = hash === noteHash

  return (
    <li>
      <NoteLink active={noteIsActive} to={noteHash}>
        {note._id}
      </NoteLink>
    </li>
  )
}

export default NoteItem
