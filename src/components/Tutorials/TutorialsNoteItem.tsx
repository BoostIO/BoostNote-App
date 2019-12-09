import React from 'react'
import { Link } from '../../lib/router'
import styled from '../../lib/styled/styled'
import {
  borderBottom,
  uiTextColor,
  secondaryBackgroundColor
} from '../../lib/styled/styleFunctions'
import cc from 'classcat'
import { TutorialsNavigatorTreeItem } from '../../lib/tutorials'

const StyledNoteListItem = styled.div`
  margin: 0;
  border-left: 2px solid transparent;
  ${uiTextColor}
  &.active,
  &:active,
  &:focus,
  &:hover {
    ${secondaryBackgroundColor}
  }
  &.active {
    border-left: 2px solid ${({ theme }) => theme.primaryColor};
  }
  user-select: none;
  ${borderBottom}

  transition: 200ms background-color;

  a {
    text-decoration: none;
  }

  .container {
    padding: 8px;
  }

  .title {
    font-weight: bold;
    font-size: 15px;
    margin-bottom: 4px;
  }
`

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
