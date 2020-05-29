import React from 'react'
import { useDb } from '../../lib/db'
import { useDialog, DialogIconTypes } from '../../lib/dialog'
import { useContextMenu, MenuTypes } from '../../lib/contextMenu'
import NavigatorItem from '../atoms/NavigatorItem'
import { useGeneralStatus } from '../../lib/generalStatus'
import { getFolderItemId } from '../../lib/nav'
import { getTransferrableNoteData } from '../../lib/dnd'
import { useTranslation } from 'react-i18next'
import { mdiFolderOpen, mdiFolder, mdiDotsVertical } from '@mdi/js'
import NavigatorButton from '../atoms/NavigatorButton'
import { useRouter } from '../../lib/router'

interface FolderNavigatorItemProps {
  active: boolean
  storageId: string
  folderPathname: string
  folderSetWithSubFolders: Set<string>
  createNoteInFolderAndRedirect: (folderPathname: string) => void
  showPromptToCreateFolder: (folderPathname: string) => void
  showPromptToRenameFolder: (folderPathname: string) => void
}

const FolderNavigatorItem = ({
  active,
  storageId,
  folderPathname,
  folderSetWithSubFolders,
  createNoteInFolderAndRedirect,
  showPromptToCreateFolder,
  showPromptToRenameFolder,
}: FolderNavigatorItemProps) => {
  const { toggleSideNavOpenedItem, sideNavOpenedItemSet } = useGeneralStatus()
  const { push } = useRouter()
  const { popup } = useContextMenu()
  const { messageBox } = useDialog()
  const { t } = useTranslation()
  const {
    createNote,
    updateNote,
    removeFolder,
    moveNoteToOtherStorage,
  } = useDb()

  const nameElements = folderPathname.split('/').slice(1)
  const folderName = nameElements[nameElements.length - 1]
  const itemId = getFolderItemId(storageId, folderPathname)
  const depth = nameElements.length - 1
  const folded = folderSetWithSubFolders.has(folderPathname)
    ? !sideNavOpenedItemSet.has(itemId)
    : undefined

  const openFolder = () => {
    push(
      `/app/storages/${storageId}/notes${
        folderPathname === '/' ? '' : folderPathname
      }`
    )
  }

  const openContextMenu = (event: React.MouseEvent) => {
    event.preventDefault()
    popup(event, [
      {
        type: MenuTypes.Normal,
        label: 'New Note',
        onClick: async () => {
          createNoteInFolderAndRedirect(folderPathname)
        },
      },
      {
        type: MenuTypes.Normal,
        label: 'New Subfolder',
        onClick: async () => {
          showPromptToCreateFolder(folderPathname)
        },
      },
      {
        type: MenuTypes.Separator,
      },
      {
        type: MenuTypes.Normal,
        label: t('folder.rename'),
        enabled: folderPathname !== '/',
        onClick: async () => {
          showPromptToRenameFolder(folderPathname)
        },
      },
      {
        type: MenuTypes.Normal,
        label: t('folder.remove'),
        enabled: folderPathname !== '/',
        onClick: () => {
          messageBox({
            title: `Remove "${folderPathname}" folder`,
            message: t('folder.removeMessage'),
            iconType: DialogIconTypes.Warning,
            buttons: [t('folder.remove'), t('general.cancel')],
            defaultButtonIndex: 0,
            cancelButtonIndex: 1,
            onClose: (value: number | null) => {
              if (value === 0) {
                removeFolder(storageId, folderPathname)
              }
            },
          })
        },
      },
    ])
  }

  const handleDrop = async (event: React.DragEvent) => {
    const transferrableNoteData = getTransferrableNoteData(event)
    if (transferrableNoteData == null) {
      return
    }

    const {
      storageId: originalNoteStorageId,
      note: originalNote,
    } = transferrableNoteData

    if (storageId === originalNoteStorageId) {
      await updateNote(storageId, originalNote._id, {
        folderPathname,
      })
    } else {
      messageBox({
        title: t('storage.moveTitle'),
        message: t('storage.moveMessage'),
        iconType: DialogIconTypes.Info,
        buttons: [t('storage.move'), t('storage.copy'), t('general.cancel')],
        defaultButtonIndex: 0,
        cancelButtonIndex: 2,
        onClose: async (value: number | null) => {
          switch (value) {
            case 0:
              await moveNoteToOtherStorage(
                originalNoteStorageId,
                originalNote._id,
                storageId,
                folderPathname
              )
              return
            case 1:
              await createNote(storageId, {
                title: originalNote.title,
                content: originalNote.content,
                folderPathname,
                tags: originalNote.tags,
                data: originalNote.data,
              })
              return
          }
        },
      })
    }
  }

  return (
    <NavigatorItem
      key={itemId}
      folded={folded}
      depth={depth}
      active={active}
      iconPath={active ? mdiFolderOpen : mdiFolder}
      label={folderName}
      onClick={openFolder}
      onDoubleClick={() => showPromptToRenameFolder(folderPathname)}
      onContextMenu={openContextMenu}
      onFoldButtonClick={() => toggleSideNavOpenedItem(itemId)}
      control={
        <NavigatorButton onClick={openContextMenu} iconPath={mdiDotsVertical} />
      }
      onDragOver={(event) => {
        event.preventDefault()
      }}
      onDrop={handleDrop}
    />
  )
}

export default FolderNavigatorItem
