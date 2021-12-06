import { mdiPlus } from '@mdi/js'
import React, { useCallback, useMemo } from 'react'
import FormToggableInput from '../../../../design/components/molecules/Form/atoms/FormToggableInput'
import { SerializedFolderWithBookmark } from '../../../interfaces/db/folder'
import { SerializedTeam } from '../../../interfaces/db/team'
import { DraggedTo } from '../../../lib/dnd'
import { useCloudDnd } from '../../../lib/hooks/sidebar/useCloudDnd'
import { useCloudApi } from '../../../lib/hooks/useCloudApi'
import { useI18n } from '../../../lib/hooks/useI18n'
import { lngKeys } from '../../../lib/i18n/types'
import { useRouter } from '../../../lib/router'
import { folderToDataTransferItem } from '../../../lib/utils/patterns'
import { sortByLexorankProperty } from '../../../lib/utils/string'
import { getFolderHref } from '../../Link/FolderLink'
import ViewManagerContentRow from './ViewManagerContentRow'
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import FolderListHeader from './FolderListHeader'

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
  const { createFolder, updateFolderPageOrder } = useCloudApi()

  const {
    dropInDocOrFolder,
    saveFolderTransferData,
    clearDragTransferData,
  } = useCloudDnd()

  const orderedFolders = useMemo(() => {
    if (folders == null) {
      return []
    }

    return sortByLexorankProperty(folders, 'pageOrder')
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over == null || active.id === over.id) {
      return
    }

    let activeItemIndex = 0
    let overItemIndex = 0
    for (let i = 0; i < orderedFolders.length; i++) {
      const folder = orderedFolders[i]
      if (folder.id === active.id) {
        activeItemIndex = i
      } else if (folder.id === over.id) {
        overItemIndex = i
      }
    }

    const movingForward = activeItemIndex < overItemIndex

    const moveAheadOf = movingForward
      ? orderedFolders[overItemIndex + 1]?.id
      : orderedFolders[overItemIndex].id

    await updateFolderPageOrder(orderedFolders[activeItemIndex], moveAheadOf)
  }

  if (folders == null) {
    return null
  }

  return (
    <>
      <FolderListHeader
        label={translate(lngKeys.GeneralFolders)}
        checked={selectingAllFolders}
        onSelect={
          selectingAllFolders ? resetFoldersInSelection : selectAllFolders
        }
        showCheckbox={currentUserIsCoreMember}
        className='content__manager__list__header--margin' // TODO discard this and set margin from its parent component
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={orderedFolders.map((folder) => folder.id)}
          strategy={verticalListSortingStrategy}
        >
          {orderedFolders.map((folder) => {
            const { id } = folder
            const href = getFolderHref(folder, team, 'index')
            return (
              <ViewManagerContentRow
                key={id}
                id={id}
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
        </SortableContext>
      </DndContext>

      {currentWorkspaceId != null && (
        <div className='content__manager__add-row content__manager__add-row--folder'>
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
