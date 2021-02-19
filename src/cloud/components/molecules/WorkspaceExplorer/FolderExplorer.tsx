import React, { useCallback, useMemo } from 'react'
import { SerializedFolderWithBookmark } from '../../../interfaces/db/folder'
import { mdiFolderOutline } from '@mdi/js'
import { StyledExplorerDepth } from './styled'
import ExplorerListItem from './ExplorerListItem'

interface FolderExplorerProps {
  rootFolders?: SerializedFolderWithBookmark[]
  childFoldersPerParentMap: Map<string, SerializedFolderWithBookmark[]>
  selectedFolderId?: string
  setSelectedFolderId: React.Dispatch<React.SetStateAction<string | undefined>>
  nestedIds: string[]
  setNestedIds: React.Dispatch<React.SetStateAction<string[]>>
}

const FolderExplorer = ({
  rootFolders = [],
  childFoldersPerParentMap,
  nestedIds,
  setNestedIds,
  selectedFolderId,
  setSelectedFolderId,
}: FolderExplorerProps) => {
  const selectFolder = useCallback(
    (folderId: string, depth: number) => {
      setNestedIds((prev) => [...prev.slice(0, depth), folderId])
      setSelectedFolderId(folderId)
    },
    [setSelectedFolderId, setNestedIds]
  )

  const childExplorers = useMemo(() => {
    if (nestedIds.length === 0) {
      return null
    }

    return nestedIds.map((id, i) => {
      const children = childFoldersPerParentMap.get(id)
      const depth = i++

      if (children == null) {
        return null
      }

      return (
        <StyledExplorerDepth key={depth}>
          {children.map((folder) => (
            <ExplorerListItem
              key={folder.id}
              emoji={folder.emoji}
              iconPath={mdiFolderOutline}
              isInCurrentTree={nestedIds.includes(folder.id)}
              isLastChildInCurrentTree={selectedFolderId === folder.id}
              label={folder.name}
              hasChildren={
                (childFoldersPerParentMap.get(folder.id) || []).length > 0
              }
              onClick={() => selectFolder(folder.id, depth + 1)}
            />
          ))}
        </StyledExplorerDepth>
      )
    })
  }, [childFoldersPerParentMap, nestedIds, selectedFolderId, selectFolder])

  return (
    <>
      <StyledExplorerDepth>
        {rootFolders.map((rootFolder) => (
          <ExplorerListItem
            key={rootFolder.id}
            emoji={rootFolder.emoji}
            iconPath={mdiFolderOutline}
            isInCurrentTree={nestedIds.includes(rootFolder.id)}
            isLastChildInCurrentTree={selectedFolderId === rootFolder.id}
            label={rootFolder.name}
            hasChildren={
              (childFoldersPerParentMap.get(rootFolder.id) || []).length > 0
            }
            onClick={() => selectFolder(rootFolder.id, 0)}
          />
        ))}
      </StyledExplorerDepth>
      {childExplorers}
    </>
  )
}

export default FolderExplorer
