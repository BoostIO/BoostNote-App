import React, { useCallback, useRef } from 'react'
import { TutorialsNavigatorTreeItem } from '../../lib/tutorials'
import TutorialsNoteItem from './TutorialsNoteItem'
import { StyledNoteListContainer } from '../NotePage/NoteList/NoteList'
import { useTranslation } from 'react-i18next'
import {
  isWithGeneralCtrlKey,
  useGlobalKeyDownHandler
} from '../../lib/keyboard'

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
  useGlobalKeyDownHandler(e => {
    switch (e.key) {
      case 'j':
        if (isWithGeneralCtrlKey(e)) {
          e.preventDefault()
          e.stopPropagation()
          navigateDown()
        }
        break
      case 'k':
        if (isWithGeneralCtrlKey(e)) {
          e.preventDefault()
          e.stopPropagation()
          navigateUp()
        }
        break
      default:
        break
    }
  })

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

  const { t } = useTranslation()

  return (
    <StyledNoteListContainer>
      <ul tabIndex={0} ref={listRef}>
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
        {notes.length === 0 && <li className='empty'>{t('note.nothing')}</li>}
      </ul>
    </StyledNoteListContainer>
  )
}

export default TutorialsNoteList
