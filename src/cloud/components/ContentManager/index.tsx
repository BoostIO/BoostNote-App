import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SerializedDocWithSupplemental } from '../../interfaces/db/doc'
import { SerializedFolderWithBookmark } from '../../interfaces/db/folder'
import { useSet } from 'react-use'
import { sortByAttributeAsc, sortByAttributeDesc } from '../../lib/utils/array'
import {
  docToDataTransferItem,
  folderToDataTransferItem,
  getDocId,
  getDocTitle,
  getFolderId,
} from '../../lib/utils/patterns'
import { SerializedWorkspace } from '../../interfaces/db/workspace'
import { StyledContentManagerList } from './styled'
import { SerializedTeam } from '../../interfaces/db/team'
import SortingOption, { sortingOrders } from './SortingOption'
import ContentManagerDocRow from './Rows/ContentManagerDocRow'
import ContentmanagerFolderRow from './Rows/ContentManagerFolderRow'
import { difference } from 'ramda'
import ContentManagerToolbar from './ContentManagerToolbar'
import styled from '../../../design/lib/styled'
import { usePreferences } from '../../lib/stores/preferences'
import EmptyRow from './Rows/EmptyRow'
import cc from 'classcat'
import ContentManagerRow from './Rows/ContentManagerRow'
import { lngKeys } from '../../lib/i18n/types'
import { useI18n } from '../../lib/hooks/useI18n'
import { useCloudDnd } from '../../lib/hooks/sidebar/useCloudDnd'
import { DraggedTo } from '../../../design/lib/dnd'
import Scroller from '../../../design/components/atoms/Scroller'
import { FormSelectOption } from '../../../design/components/molecules/Form/atoms/FormSelect'

interface ContentManagerProps {
  team: SerializedTeam
  documents: SerializedDocWithSupplemental[]
  folders?: SerializedFolderWithBookmark[]
  workspacesMap: Map<string, SerializedWorkspace>
  currentUserIsCoreMember: boolean
  currentWorkspaceId?: string
  currentFolderId?: string
  page?: string
}

const ContentManager = ({
  team,
  documents,
  folders,
  page,
  workspacesMap,
  currentUserIsCoreMember,
  currentWorkspaceId,
  currentFolderId,
}: ContentManagerProps) => {
  const { preferences, setPreferences } = usePreferences()
  const [order, setOrder] = useState<typeof sortingOrders[number]['value']>(
    preferences.folderSortingOrder
  )
  const { translate } = useI18n()

  const [
    selectedFolderSet,
    {
      add: addFolder,
      has: hasFolder,
      toggle: toggleFolder,
      reset: resetFolders,
      remove: removeFolder,
    },
  ] = useSet<string>(new Set())
  const [
    selectedDocSet,
    {
      add: addDoc,
      has: hasDoc,
      toggle: toggleDoc,
      remove: removeDoc,
      reset: resetDocs,
    },
  ] = useSet<string>(new Set())

  const currentDocumentsRef = useRef(
    new Map<string, SerializedDocWithSupplemental>(
      documents.map((doc) => [doc.id, doc])
    )
  )
  const currentFoldersRef = useRef(
    new Map<string, SerializedFolderWithBookmark>(
      (folders || []).map((folder) => [folder.id, folder])
    )
  )
  const [updating, setUpdating] = useState<string[]>([])

  useEffect(() => {
    const newMap = new Map(documents.map((doc) => [doc.id, doc]))
    const idsToClean: string[] = difference(
      [...currentDocumentsRef.current.keys()],
      [...newMap.keys()]
    )
    idsToClean.forEach(removeDoc)
    currentDocumentsRef.current = newMap
  }, [documents, removeDoc])

  useEffect(() => {
    const newMap = new Map((folders || []).map((folder) => [folder.id, folder]))
    const idsToClean: string[] = difference(
      [...currentFoldersRef.current.keys()],
      [...newMap.keys()]
    )
    idsToClean.forEach(removeFolder)
    currentFoldersRef.current = newMap
  }, [folders, removeFolder])

  const orderedDocs = useMemo(() => {
    const filteredDocs = documents.map((doc) => {
      return {
        ...doc,
        title: getDocTitle(doc, 'untitled'),
      }
    })
    switch (order) {
      case 'Title A-Z':
        return sortByAttributeAsc('title', filteredDocs)
      case 'Title Z-A':
        return sortByAttributeDesc('title', filteredDocs)
      case 'Latest Updated':
      default:
        return sortByAttributeDesc('updatedAt', filteredDocs)
    }
  }, [order, documents])

  const orderedFolders = useMemo(() => {
    if (folders == null) {
      return []
    }

    switch (order) {
      case 'Title A-Z':
        return sortByAttributeAsc('name', folders)
      case 'Title Z-A':
        return sortByAttributeDesc('name', folders)
      case 'Latest Updated':
      default:
        return sortByAttributeDesc('updatedAt', folders)
    }
  }, [order, folders])

  const selectingAllDocs = useMemo(() => {
    return orderedDocs.length > 0 && orderedDocs.every((doc) => hasDoc(doc.id))
  }, [orderedDocs, hasDoc])

  const selectingAllFolders = useMemo(() => {
    return (
      orderedFolders.length > 0 &&
      orderedFolders.every((folder) => hasFolder(folder.id))
    )
  }, [orderedFolders, hasFolder])

  const selectAllDocs = useCallback(() => {
    orderedDocs.forEach((doc) => addDoc(doc.id))
  }, [orderedDocs, addDoc])

  const selectAllFolders = useCallback(() => {
    orderedFolders.forEach((folder) => addFolder(folder.id))
  }, [orderedFolders, addFolder])

  const onChangeOrder = useCallback(
    (val: FormSelectOption) => {
      setOrder(val.value)
      setPreferences({ folderSortingOrder: val.value as any })
    },
    [setPreferences]
  )

  const {
    dropInDocOrFolder,
    saveFolderTransferData,
    saveDocTransferData,
    clearDragTransferData,
    dropOutsideFileToFolder,
  } = useCloudDnd()

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

  const onDragStartDoc = useCallback(
    (event: any, doc: SerializedDocWithSupplemental) => {
      saveDocTransferData(event, doc)
    },
    [saveDocTransferData]
  )

  const onDropExternalDocument = useCallback(
    async (event: any) => {
      if (currentWorkspaceId == null) {
        return
      }
      if (event.dataTransfer.files.length > 0) {
        return dropOutsideFileToFolder(
          event,
          currentWorkspaceId,
          currentFolderId == null ? currentWorkspaceId : currentFolderId
        )
      }
    },
    [currentFolderId, currentWorkspaceId, dropOutsideFileToFolder]
  )

  const onDropDoc = useCallback(
    (event: any, doc: SerializedDocWithSupplemental) => {
      if (event.dataTransfer.files.length > 0) {
        return dropOutsideFileToFolder(
          event,
          doc.workspaceId,
          doc.parentFolderId == null ? doc.workspaceId : doc.parentFolderId
        )
      }
      return dropInDocOrFolder(
        event,
        { type: 'doc', resource: docToDataTransferItem(doc) },
        DraggedTo.beforeItem
      )
    },
    [dropInDocOrFolder, dropOutsideFileToFolder]
  )

  const onDragEnd = useCallback(
    (event: any) => {
      clearDragTransferData(event)
    },
    [clearDragTransferData]
  )

  return (
    <Container>
      <Scroller className='cm__scroller'>
        <StyledContentManagerHeader>
          <div className='header__left' />
          <div className='header__right'>
            <SortingOption value={order} onChange={onChangeOrder} />
          </div>
        </StyledContentManagerHeader>
        <StyledContentManagerList>
          <ContentManagerRow
            onDrop={onDropExternalDocument}
            label={translate(lngKeys.GeneralDocuments)}
            checked={selectingAllDocs}
            onSelect={selectingAllDocs ? resetDocs : selectAllDocs}
            showCheckbox={currentUserIsCoreMember}
            type='header'
          />
          {orderedDocs.map((doc) => (
            <ContentManagerDocRow
              doc={doc}
              key={doc.id}
              workspace={workspacesMap.get(doc.workspaceId)}
              team={team}
              updating={updating.includes(getDocId(doc))}
              setUpdating={setUpdating}
              checked={hasDoc(doc.id)}
              onSelect={() => toggleDoc(doc.id)}
              showPath={page != null}
              currentUserIsCoreMember={currentUserIsCoreMember}
              onDrop={onDropDoc}
              onDragEnd={onDragEnd}
              onDragStart={onDragStartDoc}
            />
          ))}
          {orderedDocs.length === 0 && <EmptyRow label='No Documents' />}
          {folders != null && (
            <>
              <ContentManagerRow
                label={translate(lngKeys.GeneralFolders)}
                checked={selectingAllFolders}
                onSelect={selectingAllFolders ? resetFolders : selectAllFolders}
                showCheckbox={currentUserIsCoreMember}
                type='header'
                className={cc([
                  orderedDocs.length > 0 &&
                    'content__manager__list__header--margin',
                ])}
              />

              {orderedFolders.map((folder) => (
                <ContentmanagerFolderRow
                  folder={folder}
                  key={folder.id}
                  team={team}
                  updating={updating.includes(getFolderId(folder))}
                  setUpdating={setUpdating}
                  checked={hasFolder(folder.id)}
                  onSelect={() => toggleFolder(folder.id)}
                  currentUserIsCoreMember={currentUserIsCoreMember}
                  onDrop={onDropFolder}
                  onDragEnd={onDragEnd}
                  onDragStart={onDragStartFolder}
                />
              ))}

              {orderedFolders.length === 0 && <EmptyRow label='No Folders' />}
            </>
          )}
        </StyledContentManagerList>
      </Scroller>

      {currentUserIsCoreMember && (
        <ContentManagerToolbar
          propsColumns={[]}
          selectedDocs={selectedDocSet}
          selectedFolders={selectedFolderSet}
          documentsMap={currentDocumentsRef.current}
          foldersMap={currentFoldersRef.current}
          workspacesMap={workspacesMap}
          team={team}
          updating={updating}
          setUpdating={setUpdating}
        />
      )}
    </Container>
  )
}

export default React.memo(ContentManager)

const Container = styled.div`
  display: block;
  width: 100%;
  position: relative;
  height: 100%;

  .content__manager__list__header--margin {
    margin-top: ${({ theme }) => theme.sizes.spaces.l}px !important;
  }

  .cm__scroller {
    height: 100%;
  }
`

export const StyledContentManagerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: ${({ theme }) => theme.sizes.spaces.l}px;
  padding-right: 0;
  height: 40px;

  button {
    font-size: ${({ theme }) => theme.sizes.fonts.md}px !important;
    text-transform: uppercase !important;
  }

  .header__left {
    display: flex;
    align-items: center;
  }
  .header__right {
    display: flex;
    align-items: center;
  }
  .header__left__checkbox {
    margin-right: 5px;
    opacity: 0;
    &.header__left__checkbox--checked {
      opacity: 1;
    }
  }

  &:hover {
    .header__left__checkbox {
      opacity: 1;
    }
  }
`
