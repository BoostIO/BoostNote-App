import React, { useCallback, KeyboardEvent, useRef } from 'react'
import { TutorialsNavigatorTreeItem } from '../../lib/tutorials'
import styled from '../../lib/styled'
import TutorialsNoteItem from './TutorialsNoteItem'

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  outline: none;
  & > ul {
    flex: 1;
    margin: 0;
    padding: 0;
    list-style: none;
    overflow-y: auto;

    li.empty {
      color: ${({ theme }) => theme.uiTextColor};
    }
  }
`

type TutorialsNoteListProps = {
  currentTree: TutorialsNavigatorTreeItem
  basePathname: string
  parentTree?: TutorialsNavigatorTreeItem
  selectedNote?: TutorialsNavigatorTreeItem
  navigateUp: () => void
  navigateDown: () => void
}

const TutorialsNoteList = ({
  currentTree,
  parentTree,
  navigateUp,
  navigateDown,
  basePathname,
  selectedNote
}: TutorialsNoteListProps) => {
  const handleListKeyDown = useCallback(
    (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
          navigateDown()
          break
        case 'ArrowUp':
          navigateUp()
          break
      }
    },
    [navigateUp, navigateDown]
  )

  const listRef = useRef<HTMLUListElement>(null)

  const focusList = useCallback(() => {
    listRef.current!.focus()
  }, [])

  const notes =
    currentTree.type !== 'note'
      ? currentTree.children.filter(child => child.type === 'note')
      : parentTree == null
      ? []
      : parentTree.children.filter(child => child.type === 'note')

  return (
    <StyledContainer>
      <ul tabIndex={0} onKeyDown={handleListKeyDown} ref={listRef}>
        {notes.map(note => {
          const noteIsCurrentNote =
            selectedNote != null &&
            note.absolutePath === selectedNote.absolutePath
          return (
            <li key={note.slug}>
              <TutorialsNoteItem
                active={noteIsCurrentNote}
                note={note}
                basePathname={basePathname}
                focusList={focusList}
              />
            </li>
          )
        })}
        {notes.length === 0 && <li className='empty'>No notes</li>}
      </ul>
    </StyledContainer>
  )
}

export default TutorialsNoteList
