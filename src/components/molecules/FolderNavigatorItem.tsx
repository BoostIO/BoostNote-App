import React, { useCallback, useMemo, MouseEvent } from 'react'
import { useDb } from '../../lib/db'
import { useDialog, DialogIconTypes } from '../../lib/dialog'
import { useContextMenu, MenuTypes } from '../../lib/contextMenu'
import NavigatorItem from '../atoms/NavigatorItem'
import { useGeneralStatus } from '../../lib/generalStatus'
import { getFolderItemId } from '../../lib/nav'
import { getTransferrableNoteData } from '../../lib/dnd'
import { useTranslation } from 'react-i18next'
import { mdiFolderOpen, mdiFolder, mdiDotsVertical, mdiPlus } from '@mdi/js'
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

  const { folderName, depth } = useMemo(() => {
    const nameElements = folderPathname.split('/').slice(1)
    const folderName = nameElements[nameElements.length - 1]
    const depth = nameElements.length - 1
    return {
      nameElements,
      folderName,
      depth,
    }
  }, [folderPathname])

  const itemId = useMemo(() => {
    return getFolderItemId(storageId, folderPathname)
  }, [storageId, folderPathname])

  const folded = useMemo(() => {
    return folderSetWithSubFolders.has(folderPathname)
      ? !sideNavOpenedItemSet.has(itemId)
      : undefined
  }, [folderPathname, itemId, folderSetWithSubFolders, sideNavOpenedItemSet])

  const toggleFolded = useCallback(() => {
    toggleSideNavOpenedItem(itemId)
  }, [itemId, toggleSideNavOpenedItem])

  const openFolder = useCallback(() => {
    push(
      `/app/storages/${storageId}/notes${
        folderPathname === '/' ? '' : folderPathname
      }`
    )
  }, [storageId, folderPathname, push])

  const showFolderRemoveMessageBox = useCallback(() => {
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
  }, [storageId, folderPathname, messageBox, t, removeFolder])

  const showRenamePrompt = useCallback(() => {
    showPromptToRenameFolder(folderPathname)
  }, [folderPathname, showPromptToRenameFolder])

  const openContextMenu = useCallback(
    (event: React.MouseEvent) => {
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
          onClick: showRenamePrompt,
        },
        {
          type: MenuTypes.Normal,
          label: t('folder.remove'),
          enabled: folderPathname !== '/',
          onClick: showFolderRemoveMessageBox,
        },
      ])
    },
    [
      folderPathname,
      popup,
      t,
      createNoteInFolderAndRedirect,
      showPromptToCreateFolder,
      showRenamePrompt,
      showFolderRemoveMessageBox,
    ]
  )

  const openPlusContextMenu = useCallback(
    (event: React.MouseEvent) => {
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
      ])
    },
    [
      folderPathname,
      popup,
      createNoteInFolderAndRedirect,
      showPromptToCreateFolder,
    ]
  )

  const openMoreContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault()
      popup(event, [
        {
          type: MenuTypes.Normal,
          label: t('folder.rename'),
          enabled: folderPathname !== '/',
          onClick: showRenamePrompt,
        },
        {
          type: MenuTypes.Normal,
          label: t('folder.remove'),
          enabled: folderPathname !== '/',
          onClick: showFolderRemoveMessageBox,
        },
      ])
    },
    [folderPathname, popup, t, showRenamePrompt, showFolderRemoveMessageBox]
  )

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
      folded={folded}
      depth={depth}
      active={active}
      iconPath={active ? mdiFolderOpen : mdiFolder}
      label={folderName}
      onClick={openFolder}
      onDoubleClick={showRenamePrompt}
      onContextMenu={openContextMenu}
      onFoldButtonClick={toggleFolded}
      control={
        <>
          <NavigatorButton onClick={openPlusContextMenu} iconPath={mdiPlus} />
          <NavigatorButton
            onClick={openMoreContextMenu}
            iconPath={mdiDotsVertical}
          />
        </>
      }
      onDragOver={preventDefault}
      onDrop={handleDrop}
    />
  )
}

function preventDefault(event: MouseEvent) {
  event.preventDefault()
}

export default FolderNavigatorItem
