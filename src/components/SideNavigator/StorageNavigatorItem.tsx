import React, { useMemo } from 'react'
import SideNavigatorItem, { NavigatorNode } from './SideNavigatorItem'
import { NoteStorage } from '../../lib/db/types'
import { mdiNotebook, mdiTagMultiple, mdiTrashCan } from '@mdi/js'

interface StorageNaviagtorItemProps {
  storage: NoteStorage
}

type FolderTree = {
  [key: string]: FolderTree
}

const StorageNavigatorItem = ({ storage }: StorageNaviagtorItemProps) => {
  const folderNodes = useMemo(() => {
    const folderTree = getFolderTree(Object.keys(storage.folderMap))

    return getNavigatorNodeFromPathnameTree(
      folderTree,
      `/storages/${storage.id}/notes`
    )
  }, [storage.id, storage.folderMap])
  const tagNodes = Object.keys(storage.tagMap).map(tagName => ({
    name: tagName,
    href: `/storages/${storage.id}/tags/${tagName}`
  }))

  const node = {
    name: storage.name,
    href: `/storages/${storage.id}`,
    children: [
      {
        iconPath: mdiNotebook,
        name: 'Notes',
        href: `/storages/${storage.id}/notes`,
        children: folderNodes
      },
      {
        iconPath: mdiTagMultiple,
        name: 'Tags',
        children: tagNodes
      },
      {
        iconPath: mdiTrashCan,
        name: 'Trash Can'
      }
    ]
  }

  return <SideNavigatorItem node={node} />
}

export default StorageNavigatorItem

function getFolderTree(pathnames: string[]) {
  const tree = {}
  for (const pathname of pathnames) {
    if (pathname === '/') continue
    const [, ...folderNames] = pathname.split('/')
    let currentNode = tree
    for (let index = 0; index < folderNames.length; index++) {
      const currentPathname = folderNames[index]
      if (currentNode[currentPathname] == null) {
        currentNode[currentPathname] = {}
      }
      currentNode = currentNode[currentPathname]
    }
  }

  return tree
}

function getNavigatorNodeFromPathnameTree(
  tree: FolderTree,
  parentPathname: string
): NavigatorNode[] {
  return Object.entries(tree).map(([folderName, tree]) => {
    const pathname = parentPathname + `/${folderName}`
    return {
      name: folderName,
      href: pathname,
      children: getNavigatorNodeFromPathnameTree(tree, pathname)
    }
  })
}
