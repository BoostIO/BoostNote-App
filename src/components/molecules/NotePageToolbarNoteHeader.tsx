import React, {
  useMemo,
  useState,
  useCallback,
  KeyboardEvent,
  useRef,
  useEffect,
} from 'react'
import { mdiTextBoxOutline, mdiFolder, mdiPencil } from '@mdi/js'
import { useRouter } from '../../lib/router'
import ToolbarButton from '../atoms/ToolbarButton'
import ToolbarSlashSeparator from '../atoms/ToolbarSlashSeparator'
import { useDb } from '../../lib/db'
import styled from '../../lib/styled'
import { inputStyle } from '../../lib/styled/styleFunctions'
import {
  listenNoteDetailFocusTitleInputEvent,
  unlistenNoteDetailFocusTitleInputEvent,
} from '../../lib/events'

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
        <>
          <ToolbarButton
            iconPath={mdiTextBoxOutline}
            label={
              noteTitle != null && noteTitle.trim().length > 0
                ? noteTitle
                : 'Untitled'
            }
          />
          <ToolbarButton onClick={startEditingTitle} iconPath={mdiPencil} />
        </>
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
