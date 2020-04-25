import React from 'react'
import { useRouter, usePathnameWithoutNoteId } from '../../lib/router'
import { useDb } from '../../lib/db'
import { useDialog, DialogIconTypes } from '../../../lib/dialog'
import { useContextMenu, MenuTypes } from '../../../lib/contextMenu'
import { useFirstUser } from '../../../lib/preferences'
import NavigatorItem from '../atoms/NavigatorItem'
import { useGeneralStatus } from '../../lib/generalStatus'
import ControlButton from '../atoms/ControlButton'
import FolderListFragment from '../molecules/FolderListFragment'
import TagListFragment from '../molecules/TagListFragment'
import { useToast } from '../../../lib/toast'
import { useTranslation } from 'react-i18next'
import { mdiTrashCan, mdiBookOpen, mdiSync, mdiPlus } from '@mdi/js'
import { NoteStorage } from '../../../lib/db/types'

interface StorageNavigatorFragmentProps {
  storage: NoteStorage
}

const StorageNavigatorFragment = ({
  storage,
}: StorageNavigatorFragmentProps) => {
  const {
    createFolder,
    renameFolder,
    renameStorage,
    removeStorage,
    syncStorage,
  } = useDb()
  const currentPathname = usePathnameWithoutNoteId()

  const {
    toggleSideNavOpenedItem,
    sideNavOpenedItemSet,
    openSideNavFolderItemRecursively,
    toggleNav,
  } = useGeneralStatus()

  const { t } = useTranslation()
  const { popup } = useContextMenu()
  const { prompt, messageBox } = useDialog()
  const { push } = useRouter()
  const user = useFirstUser()
  const { pushMessage } = useToast()
  const itemId = `storage:${storage.id}`
  const storageIsFolded = !sideNavOpenedItemSet.has(itemId)
  const showPromptToCreateFolder = (folderPathname: string) => {
    prompt({
      title: 'Create a Folder',
      message: 'Enter the path where do you want to create a folder',
      iconType: DialogIconTypes.Question,
      defaultValue: folderPathname === '/' ? '/' : `${folderPathname}/`,
      submitButtonLabel: 'Create Folder',
      onClose: async (value: string | null) => {
        if (value == null) {
          return
        }
        if (value.endsWith('/')) {
          value = value.slice(0, value.length - 1)
        }
        await createFolder(storage.id, value)

        push(`/m/storages/${storage.id}/notes${value}`)

        // Open folder item
        openSideNavFolderItemRecursively(storage.id, value)
      },
    })
  }
  const showPromptToRenameFolder = (folderPathname: string) => {
    prompt({
      title: t('folder.rename'),
      message: t('folder.renameMessage'),
      iconType: DialogIconTypes.Question,
      defaultValue: folderPathname.split('/').pop(),
      submitButtonLabel: t('folder.rename'),
      onClose: async (value: string | null) => {
        const folderPathSplit = folderPathname.split('/')
        if (value == null || value === '' || value === folderPathSplit.pop()) {
          return
        }
        const newPathname = folderPathSplit.join('/') + '/' + value
        try {
          await renameFolder(storage.id, folderPathname, newPathname)
          push(`/m/storages/${storage.id}/notes${newPathname}`)
          openSideNavFolderItemRecursively(storage.id, newPathname)
        } catch (error) {
          pushMessage({
            title: t('general.error'),
            description: t('folder.renameErrorMessage'),
          })
        }
      },
    })
  }

  const allNotesPagePathname = `/m/storages/${storage.id}/notes`
  const allNotesPageIsActive = currentPathname === allNotesPagePathname

  const trashcanPagePathname = `/m/storages/${storage.id}/trashcan`
  const trashcanPageIsActive = currentPathname === trashcanPagePathname

  const controlComponents = [
    <ControlButton
      key={`${storage.id}-addFolderButton`}
      onClick={() => showPromptToCreateFolder('/')}
      iconPath={mdiPlus}
    />,
  ]

  if (storage.cloudStorage != null && user != null) {
    const cloudSync = () => {
      if (user == null) {
        pushMessage({
          title: 'No User Error',
          description: 'Please login first to sync the storage.',
        })
      }
      syncStorage(storage.id)
    }

    controlComponents.unshift(
      <ControlButton
        key={`${storage.id}-syncButton`}
        onClick={cloudSync}
        iconPath={mdiSync}
        spin={storage.sync != null}
      />
    )
  }

  return (
    <>
      <NavigatorItem
        depth={0}
        label={storage.name}
        folded={storageIsFolded}
        onFoldButtonClick={() => {
          toggleSideNavOpenedItem(itemId)
        }}
        onClick={() => {
          toggleSideNavOpenedItem(itemId)
        }}
        onContextMenu={(event) => {
          event.preventDefault()
          popup(event, [
            {
              type: MenuTypes.Normal,
              label: t('storage.rename'),
              onClick: async () => {
                prompt({
                  title: `Rename "${storage.name}" storage`,
                  message: t('storage.renameMessage'),
                  iconType: DialogIconTypes.Question,
                  defaultValue: storage.name,
                  submitButtonLabel: t('storage.rename'),
                  onClose: async (value: string | null) => {
                    if (value == null) return
                    await renameStorage(storage.id, value)
                  },
                })
              },
            },
            {
              type: MenuTypes.Normal,
              label: t('storage.remove'),
              onClick: async () => {
                messageBox({
                  title: `Remove "${storage.name}" storage`,
                  message: t('storage.removeMessage'),
                  iconType: DialogIconTypes.Warning,
                  buttons: [t('storage.remove'), t('general.cancel')],
                  defaultButtonIndex: 0,
                  cancelButtonIndex: 1,
                  onClose: (value: number | null) => {
                    if (value === 0) {
                      removeStorage(storage.id)
                    }
                  },
                })
              },
            },
          ])
        }}
        control={controlComponents}
      />
      {!storageIsFolded && (
        <>
          <NavigatorItem
            depth={1}
            label='All Notes'
            iconPath={mdiBookOpen}
            active={allNotesPageIsActive}
            onClick={() => {
              push(allNotesPagePathname)
              toggleNav()
            }}
          />
          <FolderListFragment
            storage={storage}
            showPromptToCreateFolder={showPromptToCreateFolder}
            showPromptToRenameFolder={showPromptToRenameFolder}
          />
          <TagListFragment storage={storage} />

          <NavigatorItem
            depth={1}
            label={t('general.trash')}
            iconPath={mdiTrashCan}
            active={trashcanPageIsActive}
            onClick={() => {
              push(trashcanPagePathname)
              toggleNav()
            }}
            onContextMenu={(event) => {
              event.preventDefault()
              // TODO: Implement context menu(restore all notes)
            }}
          />
        </>
      )}
    </>
  )
}
export default StorageNavigatorFragment
