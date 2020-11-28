import React, {
  useMemo,
  useState,
  useCallback,
  KeyboardEvent,
  useRef,
  useEffect,
  MouseEventHandler,
} from 'react'
import { mdiTextBoxOutline, mdiFolder, mdiPencilOutline } from '@mdi/js'
import { useRouter } from '../../lib/router'
import ToolbarButton from '../atoms/ToolbarButton'
import ToolbarSlashSeparator from '../atoms/ToolbarSlashSeparator'
import { useDb } from '../../lib/db'
import styled from '../../lib/styled'
import {
  inputStyle,
  flexCenter,
  textOverflow,
} from '../../lib/styled/styleFunctions'
import {
  listenNoteDetailFocusTitleInputEvent,
  unlistenNoteDetailFocusTitleInputEvent,
} from '../../lib/events'
import Icon from '../atoms/Icon'
import cc from 'classcat'

interface NotePageToolbarNoteHeaderProps {
  storageId: string
  storageName: string
  noteId: string
  noteFolderPathname: string
  noteTitle: string
}

interface FolderData {
  name: string
  pathname: string
}

const NotePageToolbarNoteHeader = ({
  storageId,
  noteId,
  noteFolderPathname,
  noteTitle,
}: NotePageToolbarNoteHeaderProps) => {
  const { push } = useRouter()
  const { updateNote } = useDb()

  const folderDataList = useMemo<FolderData[]>(() => {
    if (noteFolderPathname === '/') {
      return []
    }
    const folderNames = noteFolderPathname.slice(1).split('/')
    let pathname = ''
    const folderDataList = []
    for (const folderName of folderNames) {
      pathname += '/' + folderName
      folderDataList.push({
        name: folderName,
        pathname,
      })
    }
    return folderDataList
  }, [noteFolderPathname])

  const navigateToWorkspace = useCallback(() => {
    push(`/app/storages/${storageId}/notes`)
  }, [push, storageId])

  const [editingTitle, setEditingTitle] = useState(false)
  const [newTitle, setNewTitle] = useState(noteTitle)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const startEditingTitle = useCallback(() => {
    setNewTitle(noteTitle)
    setEditingTitle(true)
  }, [noteTitle])

  useEffect(() => {
    if (editingTitle && titleInputRef.current != null) {
      titleInputRef.current.focus()
    }
  }, [editingTitle])

  const finishEditingTitle = useCallback(() => {
    setEditingTitle(false)
    updateNote(storageId, noteId, { title: newTitle })
  }, [storageId, noteId, newTitle, updateNote])

  const stopEditingTitle = useCallback(() => {
    setEditingTitle(false)
  }, [])

  const updateNewTitle = useCallback((event) => {
    setNewTitle(event.target.value)
  }, [])

  const handleTitleInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      switch (event.key) {
        case 'Enter':
          event.preventDefault()
          finishEditingTitle()
          return
        case 'Escape':
          event.preventDefault()
          stopEditingTitle()
      }
    },
    [finishEditingTitle, stopEditingTitle]
  )

  useEffect(() => {
    listenNoteDetailFocusTitleInputEvent(startEditingTitle)
    return () => {
      unlistenNoteDetailFocusTitleInputEvent(startEditingTitle)
    }
  }, [startEditingTitle])

  return (
    <>
      <ToolbarButton onClick={navigateToWorkspace} label='..' />
      {folderDataList.length > 0 && (
        <>
          <ToolbarSlashSeparator />
          <ToolbarButton
            iconPath={mdiFolder}
            label={folderDataList[folderDataList.length - 1].name}
            limitWidth={true}
          />
        </>
      )}

      <ToolbarSlashSeparator />
      {editingTitle ? (
        <TitleInput
          ref={titleInputRef}
          value={newTitle}
          onChange={updateNewTitle}
          onKeyDown={handleTitleInputKeyDown}
          onBlur={finishEditingTitle}
          placeholder='Title'
        />
      ) : (
        <NoteTitleButton title={noteTitle} onClick={startEditingTitle} />
      )}
    </>
  )
}

export default NotePageToolbarNoteHeader

const TitleInput = styled.input`
  ${inputStyle}
  flex: 1;
  margin: 0 5px;
  display: block;
`

interface NoteTitleButtonProps {
  title?: string
  onClick: MouseEventHandler<HTMLButtonElement>
}

const NoteTitleButton = ({ title, onClick }: NoteTitleButtonProps) => {
  const titleIsEmpty = title == null || title.trim().length === 0

  return (
    <NoteTitleButtonContainer className={cc([])} onClick={onClick}>
      <Icon className='icon' path={mdiTextBoxOutline} />
      <div className={cc(['label', titleIsEmpty && 'empty'])}>
        {titleIsEmpty ? 'Untitled' : title}
      </div>
      <Icon className='hoverIcon' path={mdiPencilOutline} />
    </NoteTitleButtonContainer>
  )
}

const NoteTitleButtonContainer = styled.button`
  height: 34px;
  min-width: 28px;

  box-sizing: border-box;
  outline: none;

  background-color: transparent;
  ${flexCenter}
  overflow: hidden;

  border: none;
  cursor: pointer;
  padding: 0 5px;

  & > .icon {
    font-size: 18px;
    flex-shrink: 0;
  }

  & > .label {
    font-size: 14px;
    ${textOverflow}
    &.empty {
      color: ${({ theme }) => theme.disabledUiTextColor};
    }
  }

  & > .icon + .label {
    margin-left: 2px;
  }

  & > .hoverIcon {
    margin-left: 2px;
    opacity: 0;
    transition: opacity 200ms ease-in-out;
  }

  transition: color 200ms ease-in-out;
  color: ${({ theme }) => theme.navItemColor};
  &:hover {
    color: ${({ theme }) => theme.navButtonHoverColor};

    & > .hoverIcon {
      opacity: 1;
    }
  }

  &:active,
  &.active {
    color: ${({ theme }) => theme.navButtonActiveColor};
    & > .hoverIcon {
      opacity: 1;
    }
  }
`
