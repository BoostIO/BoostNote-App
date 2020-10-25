import React, { useMemo } from 'react'
import {
  NoteStorage,
  NoteDoc,
  PopulatedFolderDoc,
  ObjectMap,
} from '../../lib/db/types'
import { usePathnameWithoutNoteId } from '../../lib/routeParams'
import { useGeneralStatus } from '../../lib/generalStatus'
import { getFolderItemId } from '../../lib/nav'
import FolderNavigatorItem from './FolderNavigatorItem'
import NavigatorItem from '../atoms/NavigatorItem'
import { mdiTextBoxOutline } from '@mdi/js'

interface FolderNoteNavigatorFragment {
  storage: NoteStorage
  createNoteInFolderAndRedirect: (folderPathname: string) => void
  showPromptToCreateFolder: (folderPathname: string) => void
  showPromptToRenameFolder: (folderPathname: string) => void
}

const FolderNoteNavigatorFragment = ({
  storage,
  showPromptToCreateFolder,
  showPromptToRenameFolder,
  createNoteInFolderAndRedirect,
}: FolderNoteNavigatorFragment) => {
  const { folderMap, id: storageId } = storage

  const { sideNavOpenedItemSet } = useGeneralStatus()

  const currentPathnameWithoutNoteId = usePathnameWithoutNoteId()

  const folderPathnames = useMemo(() => {
    return Object.keys(folderMap).sort((a, b) => a.localeCompare(b))
  }, [folderMap])

  const folderSetWithSubFolders = useMemo(() => {
    return folderPathnames.reduce((folderSet, folderPathname) => {
      if (folderPathname !== '/') {
        const nameElements = folderPathname.slice(1).split('/')
        const parentFolderPathname =
          '/' + nameElements.slice(0, nameElements.length - 1).join('/')
        folderSet.add(parentFolderPathname)
      }
      return folderSet
    }, new Set<string>())
  }, [folderPathnames])

  const openedFolderPathnameList = useMemo(() => {
    const tree = getFolderNameElementTree(folderPathnames)
    return getOpenedFolderPathnameList(
      tree,
      storageId,
      sideNavOpenedItemSet,
      '/',
      storage.folderMap,
      storage.noteMap
    )
  }, [
    folderPathnames,
    storageId,
    sideNavOpenedItemSet,
    storage.folderMap,
    storage.noteMap,
  ])

  return (
    <>
      {openedFolderPathnameList.map((item) => {
        if (item.type === 'folder') {
          return (
            <FolderNavigatorItem
              key={`folder:${item.pathname}`}
              active={
                currentPathnameWithoutNoteId ===
                `/app/storages/${storageId}/notes${item.pathname}`
              }
              folderName={item.name}
              depth={item.depth}
              storageId={storage.id}
              folderPathname={item.pathname}
              folderSetWithSubFolders={folderSetWithSubFolders}
              createNoteInFolderAndRedirect={createNoteInFolderAndRedirect}
              showPromptToCreateFolder={showPromptToCreateFolder}
              showPromptToRenameFolder={showPromptToRenameFolder}
            />
          )
        }

        return (
          <NavigatorItem
            key={item.id}
            iconPath={mdiTextBoxOutline}
            label={item.title}
            depth={item.depth}
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

interface FolderNavItem {
  type: 'folder'
  name: string
  pathname: string
  depth: number
}

interface NoteNavItem {
  type: 'note'
  id: string
  title: string
  folderPathname: string
  depth: number
}

type NavItem = FolderNavItem | NoteNavItem

function getOpenedFolderPathnameList(
  tree: {},
  storageId: string,
  openItemIdSet: Set<string>,
  parentPathname: string,
  folderMap: ObjectMap<PopulatedFolderDoc>,
  noteMap: ObjectMap<NoteDoc>
): NavItem[] {
  const names = Object.keys(tree)
  const itemList: NavItem[] = []
  for (const name of names) {
    const pathname =
      parentPathname === '/' ? `/${name}` : `${parentPathname}/${name}`
    if (pathname === '/') {
      continue
    }
    const nameElements = pathname.split('/').slice(1)
    const depth = nameElements.length - 1
    itemList.push({
      type: 'folder',
      pathname,
      name,
      depth,
    })

    const folderIsOpened = openItemIdSet.has(
      getFolderItemId(storageId, pathname)
    )
    if (folderIsOpened) {
      itemList.push(
        ...getOpenedFolderPathnameList(
          tree[name],
          storageId,
          openItemIdSet,
          pathname,
          folderMap,
          noteMap
        )
      )

      const folderDoc = folderMap[pathname]
      if (folderIsOpened && folderDoc != null) {
        const noteIds = [...folderDoc.noteIdSet]
        noteIds.forEach((noteId) => {
          const noteDoc = noteMap[noteId]
          if (noteDoc == null) {
            return
          }
          itemList.push({
            type: 'note',
            id: noteDoc._id,
            title: noteDoc.title,
            folderPathname: noteDoc.folderPathname,
            depth: depth + 1,
          })
        })
      }
    }
  }
  return itemList
}

export default FolderNoteNavigatorFragment
