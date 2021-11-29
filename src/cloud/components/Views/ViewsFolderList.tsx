import React, { useCallback, useMemo } from 'react'
import { sortByAttributeAsc } from '../../../design/lib/utils/array'
import { SerializedFolderWithBookmark } from '../../interfaces/db/folder'
import { SerializedTeam } from '../../interfaces/db/team'
import { DraggedTo } from '../../lib/dnd'
import { useCloudDnd } from '../../lib/hooks/sidebar/useCloudDnd'
import { useI18n } from '../../lib/hooks/useI18n'
import { lngKeys } from '../../lib/i18n/types'
import { folderToDataTransferItem, getFolderId } from '../../lib/utils/patterns'
import TableViewContentManagerFolderRow from './Table/TableViewContentManagerFolderRow'
import TableViewContentManagerNewFolderRow from './Table/TableViewContentManagerNewFolderRow'
import TableViewContentManagerRow from './Table/TableViewContentManagerRow'

interface ViewsFolderListProps {
  folders?: SerializedFolderWithBookmark[]
  currentUserIsCoreMember: boolean
  team: SerializedTeam
  currentWorkspaceId?: string
  currentFolderId?: string
  updating: string[]
  setUpdating: React.Dispatch<React.SetStateAction<string[]>>
  addFolderInSelection: (key: string) => void
  hasFolderInSelection: (key: string) => boolean
  toggleFolderInSelection: (key: string) => void
  resetFoldersInSelection: () => void
}

export const ViewsFolderList = ({
  folders,
  updating,
  team,
  currentUserIsCoreMember,
  currentFolderId,
  currentWorkspaceId,
  setUpdating,
  addFolderInSelection,
  hasFolderInSelection,
  toggleFolderInSelection,
  resetFoldersInSelection,
}: ViewsFolderListProps) => {
  const { translate } = useI18n()

  const {
    dropInDocOrFolder,
    saveFolderTransferData,
    clearDragTransferData,
  } = useCloudDnd()

  const orderedFolders = useMemo(() => {
    if (folders == null) {
      return []
    }

    return sortByAttributeAsc('name', folders)
  }, [folders])

  const selectingAllFolders = useMemo(() => {
    return (
      orderedFolders.length > 0 &&
      orderedFolders.every((folder) => hasFolderInSelection(folder.id))
    )
  }, [orderedFolders, hasFolderInSelection])

  const selectAllFolders = useCallback(() => {
    if (folders == null) {
      return
    }
    folders.forEach((folder) => addFolderInSelection(folder.id))
  }, [folders, addFolderInSelection])

  const onDragStartFolder = useCallback(
    (event: any, folder: SerializedFolderWithBookmark) => {
      saveFolderTransferData(event, folder)
    },
    [saveFolderTransferData]
  )

  const onDropFolder = useCallback(
    (event, folder: SerializedFolderWithBookmark) =>
      dropInDocOrFolder(
        event,
        { type: 'folder', resource: folderToDataTransferItem(folder) },
        DraggedTo.insideFolder
      ),
    [dropInDocOrFolder]
  )

  if (folders == null) {
    return null
  }

  return (
    <>
      <TableViewContentManagerRow
        label={translate(lngKeys.GeneralFolders)}
        checked={selectingAllFolders}
        onSelect={
          selectingAllFolders ? resetFoldersInSelection : selectAllFolders
        }
        showCheckbox={currentUserIsCoreMember}
        type='header'
        className='content__manager__list__header--margin'
      />

      {orderedFolders.map((folder) => (
        <TableViewContentManagerFolderRow
          folder={folder}
          key={folder.id}
          team={team}
          updating={updating.includes(getFolderId(folder))}
          setUpdating={setUpdating}
          checked={hasFolderInSelection(folder.id)}
          onSelect={() => toggleFolderInSelection(folder.id)}
          currentUserIsCoreMember={currentUserIsCoreMember}
          onDrop={onDropFolder}
          onDragEnd={(event) => clearDragTransferData(event)}
          onDragStart={onDragStartFolder}
        />
      ))}

      {currentWorkspaceId != null && (
        <TableViewContentManagerNewFolderRow
          className='content__manager--no-border'
          team={team}
          folderId={currentFolderId}
          workspaceId={currentWorkspaceId}
        />
      )}
    </>
  )
}

export default ViewsFolderList
