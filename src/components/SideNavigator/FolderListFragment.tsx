import React, { useMemo } from 'react'
import { useDb } from '../../lib/db'
import {
  mdiFolderOutline,
  mdiFolderOpenOutline,
  mdiPlusCircleOutline
} from '@mdi/js'
import { useDialog, DialogIconTypes } from '../../lib/dialog'
import { useContextMenu, MenuTypes } from '../../lib/contextMenu'
import SideNavigatorItem from './SideNavigatorItem'
import { NoteStorage } from '../../lib/db/types'
import { usePathnameWithoutNoteId, useRouter } from '../../lib/router'
import { useGeneralStatus } from '../../lib/generalStatus'
import ControlButton from './ControlButton'
import { getFolderItemId } from '../../lib/nav'

interface FolderListFragmentProps {
  storage: NoteStorage
  showPromptToCreateFolder: (folderPathname: string) => void
}

const FolderListFragment = ({
  storage,
  showPromptToCreateFolder
}: FolderListFragmentProps) => {
  const { removeFolder, updateNote } = useDb()
  const { push } = useRouter()
  const { messageBox } = useDialog()
  const { popup } = useContextMenu()
  const { folderMap, id: storageId } = storage

  const { toggleSideNavOpenedItem, sideNavOpenedItemSet } = useGeneralStatus()

  const currentPathnameWithoutNoteId = usePathnameWithoutNoteId()

  const folderPathnameListExceptRoot = useMemo(() => {
    const folderPathnameList = Object.keys(folderMap).sort((a, b) =>
      a.localeCompare(b)
    )
    return folderPathnameList.slice(1)
  }, [folderMap])

  const createOnFolderItemClickHandler = (folderPathname: string) => {
    return () => {
      push(
        `/app/storages/${storage.id}/notes${
          folderPathname === '/' ? '' : folderPathname
        }`
      )
    }
  }

  const createOnContextMenuHandler = (
    storageId: string,
    folderPathname: string
  ) => {
    return (event: React.MouseEvent) => {
      event.preventDefault()
      popup(event, [
        {
          type: MenuTypes.Normal,
          label: 'New Folder',
          onClick: async () => {
            showPromptToCreateFolder(folderPathname)
          }
        },
        {
          type: MenuTypes.Normal,
          label: 'Remove Folder',
          enabled: folderPathname !== '/',
          onClick: () => {
            messageBox({
              title: `Remove "${folderPathname}" folder`,
              message: 'All notes and subfolders will be deleted.',
              iconType: DialogIconTypes.Warning,
              buttons: ['Remove Folder', 'Cancel'],
              defaultButtonIndex: 0,
              cancelButtonIndex: 1,
              onClose: (value: number | null) => {
                if (value === 0) {
                  removeFolder(storageId, folderPathname)
                }
              }
            })
          }
        }
      ])
    }
  }

  const folderSetWithSubFolders = useMemo(() => {
    return folderPathnameListExceptRoot.reduce((folderSet, folderPathname) => {
      if (folderPathname !== '/') {
        const nameElements = folderPathname.slice(1).split('/')
        const parentFolderPathname =
          '/' + nameElements.slice(0, nameElements.length - 1).join('/')
        folderSet.add(parentFolderPathname)
      }
      return folderSet
    }, new Set())
  }, [folderPathnameListExceptRoot])

  const openedFolderPathnameList = useMemo(() => {
    const tree = getFolderNameElementTree(folderPathnameListExceptRoot)
    return getOpenedFolderPathnameList(
      tree,
      storageId,
      sideNavOpenedItemSet,
      '/'
    )
  }, [folderPathnameListExceptRoot, storageId, sideNavOpenedItemSet])

  const rootFolderIsActive =
    currentPathnameWithoutNoteId === `/app/storages/${storageId}/notes`

  return (
    <>
      <SideNavigatorItem
        depth={1}
        active={rootFolderIsActive}
        iconPath={rootFolderIsActive ? mdiFolderOpenOutline : mdiFolderOutline}
        label='Notes'
        onClick={createOnFolderItemClickHandler('/')}
        onContextMenu={createOnContextMenuHandler(storageId, '/')}
      />
      {openedFolderPathnameList.map((folderPathname: string) => {
        const nameElements = folderPathname.split('/').slice(1)
        const folderName = nameElements[nameElements.length - 1]
        const itemId = getFolderItemId(storageId, folderPathname)
        const depth = nameElements.length
        const folded = folderSetWithSubFolders.has(folderPathname)
          ? !sideNavOpenedItemSet.has(itemId)
          : undefined

        const folderIsActive =
          currentPathnameWithoutNoteId ===
          `/app/storages/${storageId}/notes${folderPathname}`
        return (
          <SideNavigatorItem
            key={itemId}
            folded={folded}
            depth={depth}
            active={folderIsActive}
            iconPath={folderIsActive ? mdiFolderOpenOutline : mdiFolderOutline}
            label={folderName}
            onClick={createOnFolderItemClickHandler(folderPathname)}
            onContextMenu={createOnContextMenuHandler(
              storage.id,
              folderPathname
            )}
            onFoldButtonClick={() => toggleSideNavOpenedItem(itemId)}
            controlComponents={[
              <ControlButton
                key='addFolderButton'
                onClick={() => showPromptToCreateFolder(folderPathname)}
                iconPath={mdiPlusCircleOutline}
              />
            ]}
            onDragOver={event => {
              event.preventDefault()
            }}
            onDrop={async event => {
              const {
                storageId: targetNoteStorageId,
                note: targetNote
              } = JSON.parse(
                event.dataTransfer.getData('application/x-note-json')
              )

              if (storageId === targetNoteStorageId) {
                await updateNote(storageId, targetNote._id, {
                  folderPathname
                })
              } else {
                // Ask copy or move
                // If move, create new one and remove original
                // If copy, just create new one
              }
            }}
          />
        )
      })}
    </>
  )
}

function getFolderNameElementTree(folderPathnameList: string[]) {
  return folderPathnameList.reduce((tree, folderPathname) => {
    const nameElements = folderPathname.slice(1).split('/')

    let targetTree = tree
    for (const nameElement of nameElements) {
      if (targetTree[nameElement] == null) {
        targetTree[nameElement] = {}
      }
      targetTree = targetTree[nameElement]
    }

    return tree
  }, {})
}

function getOpenedFolderPathnameList(
  tree: {},
  storageId: string,
  openItemIdSet: Set<string>,
  parentPathname: string
) {
  const names = Object.keys(tree)
  const pathnameList: string[] = []
  for (const name of names) {
    const pathname =
      parentPathname === '/' ? `/${name}` : `${parentPathname}/${name}`
    pathnameList.push(pathname)
    if (openItemIdSet.has(getFolderItemId(storageId, pathname))) {
      pathnameList.push(
        ...getOpenedFolderPathnameList(
          tree[name],
          storageId,
          openItemIdSet,
          pathname
        )
      )
    }
  }
  return pathnameList
}

export default FolderListFragment
