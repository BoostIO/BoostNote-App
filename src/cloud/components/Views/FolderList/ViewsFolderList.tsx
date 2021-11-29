import { mdiPlus } from '@mdi/js'
import React, { useCallback, useMemo } from 'react'
import FormToggableInput from '../../../../design/components/molecules/Form/atoms/FormToggableInput'
import { sortByAttributeAsc } from '../../../../design/lib/utils/array'
import { SerializedFolderWithBookmark } from '../../../interfaces/db/folder'
import { SerializedTeam } from '../../../interfaces/db/team'
import { DraggedTo } from '../../../lib/dnd'
import { useCloudDnd } from '../../../lib/hooks/sidebar/useCloudDnd'
import { useCloudApi } from '../../../lib/hooks/useCloudApi'
import { useI18n } from '../../../lib/hooks/useI18n'
import { lngKeys } from '../../../lib/i18n/types'
import { useRouter } from '../../../lib/router'
import { folderToDataTransferItem } from '../../../lib/utils/patterns'
import { getFolderHref } from '../../Link/FolderLink'
import ViewManagerContentRow from './ViewManagerContentRow'

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
  team,
  currentUserIsCoreMember,
  currentFolderId,
  currentWorkspaceId,
  addFolderInSelection,
  hasFolderInSelection,
  toggleFolderInSelection,
  resetFoldersInSelection,
}: ViewsFolderListProps) => {
  const { translate } = useI18n()
  const { push } = useRouter()
  const { createFolder } = useCloudApi()

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
      <ViewManagerContentRow
        label={translate(lngKeys.GeneralFolders)}
        checked={selectingAllFolders}
        onSelect={
          selectingAllFolders ? resetFoldersInSelection : selectAllFolders
        }
        showCheckbox={currentUserIsCoreMember}
        type='header'
        className='content__manager__list__header--margin'
      />

      {orderedFolders.map((folder) => {
        const href = getFolderHref(folder, team, 'index')
        return (
          <ViewManagerContentRow
            key={folder.id}
            checked={hasFolderInSelection(folder.id)}
            onSelect={() => toggleFolderInSelection(folder.id)}
            showCheckbox={currentUserIsCoreMember}
            label={folder.name}
            emoji={folder.emoji}
            labelHref={href}
            labelOnclick={() => push(href)}
            onDragStart={(event: any) => onDragStartFolder(event, folder)}
            onDragEnd={(event: any) => clearDragTransferData(event)}
            onDrop={(event: any) => onDropFolder(event, folder)}
          />
        )
      })}

      {currentWorkspaceId != null && (
        <div className='content__manager__add-row'>
          <FormToggableInput
            iconPath={mdiPlus}
            variant='transparent'
            label={translate(lngKeys.ModalsCreateNewFolder)}
            submit={(val: string) =>
              createFolder(
                team,
                {
                  folderName: val,
                  description: '',
                  workspaceId: currentWorkspaceId,
                  parentFolderId: currentFolderId,
                },
                { skipRedirect: true }
              )
            }
          />
        </div>
      )}
    </>
  )
}

export default ViewsFolderList
