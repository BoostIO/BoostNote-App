import React, { useCallback, MouseEventHandler, useState } from 'react'
import NavigatorItem from '../atoms/NavigatorItem'
import { mdiCardTextOutline, mdiDotsVertical } from '@mdi/js'
import { useStorageRouter } from '../../lib/storageRouter'
import { NoteDoc, NoteDocEditibleProps } from '../../lib/db/types'
import NavigatorButton from '../atoms/NavigatorButton'
import { openContextMenu } from '../../lib/electronOnly'
import { useToast } from '../../lib/toast'
import { useRouter } from '../../lib/router'
import { useGeneralStatus } from '../../lib/generalStatus'
import {
  folderPathnameFormat,
  getTransferableTextData,
  noteIdFormat,
  setTransferableTextData,
} from '../../lib/dnd'

interface NoteNavigatorItemProps {
  storageId: string
  noteId: string
  noteTitle: string
  noteFolderPath: string
  noteBookmarked: boolean
  active: boolean
  depth: number
  bookmarkNote: (
    storageId: string,
    noteId: string
  ) => Promise<NoteDoc | undefined>
  unbookmarkNote: (
    storageId: string,
    noteId: string
  ) => Promise<NoteDoc | undefined>
  trashNote: (storageId: string, noteId: string) => Promise<NoteDoc | undefined>
  updateNote(
    storageId: string,
    noteId: string,
    noteProps: Partial<NoteDocEditibleProps>
  ): Promise<NoteDoc | undefined>
  renameFolder: (
    storageName: string,
    pathname: string,
    newName: string
  ) => Promise<void>
}

const NoteNavigatorItem = ({
  storageId,
  noteId,
  noteTitle,
  noteFolderPath,
  active,
  depth,
  noteBookmarked,
  bookmarkNote,
  unbookmarkNote,
  trashNote,
  updateNote,
  renameFolder,
}: NoteNavigatorItemProps) => {
  const [draggedOver, setDraggedOver] = useState<boolean>(false)
  const emptyTitle = noteTitle.trim().length === 0
  const { navigateToNote } = useStorageRouter()
  const { pushMessage } = useToast()
  const { push } = useRouter()
  const { openSideNavFolderItemRecursively } = useGeneralStatus()

  const navigate = useCallback(() => {
    navigateToNote(storageId, noteId, noteFolderPath)
  }, [navigateToNote, storageId, noteId, noteFolderPath])

  const openNoteContextMenu: MouseEventHandler = useCallback(
    (event) => {
      event.preventDefault()
      openContextMenu({
        menuItems: [
          !noteBookmarked
            ? {
                label: 'Bookmark Note',
                click: () => {
                  bookmarkNote(storageId, noteId)
                },
              }
            : {
                label: 'Unbookmark Note',
                click: () => {
                  unbookmarkNote(storageId, noteId)
                },
              },
          { type: 'separator' },
          {
            label: 'Trash Note',
            click: () => {
              trashNote(storageId, noteId)
            },
          },
        ],
      })
    },
    [storageId, noteId, noteBookmarked, bookmarkNote, unbookmarkNote, trashNote]
  )

  const handleDragOverNoteItem = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
    setDraggedOver(true)
  }, [])

  const handleDragStartNoteItem = (event: React.DragEvent) => {
    setTransferableTextData(event, noteIdFormat, noteId)
  }

  const handleDropFolderToNoteItem = (
    sourceFolderPathname: string,
    destinationFolderPathname: string
  ) => {
    const sourceFolderName = sourceFolderPathname.substring(
      sourceFolderPathname.lastIndexOf('/')
    )
    const newFolderPathname = `${destinationFolderPathname}${sourceFolderName}`
    renameFolder(
      storageId,
      sourceFolderPathname == '' ? '/' : sourceFolderPathname,
      newFolderPathname
    )
      .then(() => {
        // refresh works for file system (FSNote) database
        push(`/app/storages/${storageId}/notes${newFolderPathname}`)
        openSideNavFolderItemRecursively(storageId, newFolderPathname)
      })
      .catch((err) => {
        pushMessage({
          title: 'Folder Structure Update Failed',
          description: `Updating folder location failed. Reason: ${
            err != null && err.message != null ? err.message : 'Unknown'
          }`,
        })
      })
  }

  const handleDropNoteToNoteFolder = (
    noteId: string,
    destinationFolderPathname: string
  ) => {
    // move folder pathname of the note to new location (target destination)
    updateNote(storageId, noteId, {
      folderPathname: destinationFolderPathname,
    }).then((r) => console.log('updated note', r))
  }

  const handleDropNavigatorItem = (event: React.DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setDraggedOver(false)

    const sourceFolderPathname = getTransferableTextData(
      event,
      folderPathnameFormat
    )
    if (sourceFolderPathname != null) {
      handleDropFolderToNoteItem(sourceFolderPathname, noteFolderPath)
    } else {
      const noteId = getTransferableTextData(event, noteIdFormat)
      if (noteId == null) {
        return
      }
      handleDropNoteToNoteFolder(noteId, noteFolderPath)
    }
  }

  const handleDragLeaveNoteItem = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setDraggedOver(false)
  }, [])

  return (
    <NavigatorItem
      active={active}
      iconPath={mdiCardTextOutline}
      label={emptyTitle ? 'Untitled' : noteTitle}
      depth={depth}
      subtle={emptyTitle}
      onClick={navigate}
      onContextMenu={openNoteContextMenu}
      control={
        <NavigatorButton
          iconPath={mdiDotsVertical}
          onClick={openNoteContextMenu}
        />
      }
      draggable={true}
      draggedOver={draggedOver}
      onDragOver={(e) => handleDragOverNoteItem(e)}
      onDragStart={handleDragStartNoteItem}
      onDrop={handleDropNavigatorItem}
      onDragLeave={(e) => handleDragLeaveNoteItem(e)}
    />
  )
}

export default NoteNavigatorItem
