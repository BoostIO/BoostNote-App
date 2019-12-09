import React from 'react'
import { Link } from '../../lib/router'
import cc from 'classcat'
import { TutorialsNavigatorTreeItem } from '../../lib/tutorials'
import { StyledNoteListItem } from '../NotePage/NoteList/NoteItem'

type TutorialsNoteItemProps = {
  note: TutorialsNavigatorTreeItem
  active: boolean
  basePathname: string
  focusList: () => void
}

export default ({
  note,
  active,
  basePathname,
  focusList
}: TutorialsNoteItemProps) => {
  const href = `${basePathname}/notes/note:${note.slug}`

  return (
    <StyledNoteListItem className={cc([active && 'active'])}>
      <Link href={href} onFocus={focusList}>
        <div className='container'>
          <div className='title'>{note.label}</div>
        </div>
      </Link>
    </StyledNoteListItem>
  )
}
