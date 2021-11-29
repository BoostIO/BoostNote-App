import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useSet } from 'react-use'
import { difference } from 'lodash'
import Flexbox from '../../../design/components/atoms/Flexbox'
import styled from '../../../design/lib/styled'
import { SerializedDocWithSupplemental } from '../../interfaces/db/doc'
import { SerializedFolderWithBookmark } from '../../interfaces/db/folder'
import { useCloudApi } from '../../lib/hooks/useCloudApi'
import ContentManagerToolbar from '../ContentManager/ContentManagerToolbar'
import ViewsSelector from './ViewsSelector'
import { sortTableViewColumns } from '../../lib/views/table'
import { SerializedView, ViewParent } from '../../interfaces/db/view'
import { SerializedWorkspace } from '../../interfaces/db/workspace'
import { SerializedTeam } from '../../interfaces/db/team'
import TableView from './Table/TableView'
import ViewsFolderList from './FolderList/ViewsFolderList'
import Scroller from '../../../design/components/atoms/Scroller'

type ViewsManagerProps = {
  views: SerializedView[]
  parent: ViewParent
  workspacesMap: Map<string, SerializedWorkspace>
  docs: SerializedDocWithSupplemental[]
  folders?: SerializedFolderWithBookmark[]
  currentUserIsCoreMember: boolean
  currentWorkspaceId?: string
  currentFolderId?: string
  team: SerializedTeam
}

export const ViewsManager = ({
  views,
  parent,
  team,
  docs,
  folders,
  currentUserIsCoreMember,
  currentFolderId,
  currentWorkspaceId,
  workspacesMap,
}: ViewsManagerProps) => {
  const [selectedViewId, setSelectedViewId] = useState<number | undefined>(() =>
    views.length > 0 ? views[0].id : undefined
  )
  const [updating, setUpdating] = useState<string[]>([])
  const { createViewApi } = useCloudApi()
  const [
    selectedFolderSet,
    {
      add: addFolderInSelection,
      has: hasFolderInSelection,
      toggle: toggleFolderInSelection,
      reset: resetFoldersInSelection,
      remove: removeFolderInSelection,
    },
  ] = useSet<string>(new Set())
  const [
    selectedDocSet,
    {
      add: addDocinSelection,
      has: hasDocInSelection,
      toggle: toggleDocInSelection,
      remove: removeDocInSelection,
      reset: resetDocsInSelection,
    },
  ] = useSet<string>(new Set())
  const parentRef = useRef(parent)

  const currentDocumentsRef = useRef(
    new Map<string, SerializedDocWithSupplemental>(
      docs.map((doc) => [doc.id, doc])
    )
  )
  const currentFoldersRef = useRef(
    new Map<string, SerializedFolderWithBookmark>(
      (folders || []).map((folder) => [folder.id, folder])
    )
  )

  useEffect(() => {
    if (
      parent.type !== parentRef.current.type ||
      parentRef.current.target.id !== parent.target.id
    ) {
      setSelectedViewId(views.length > 0 ? views[0].id : undefined)
      parentRef.current = parent
    }
  }, [parent, views])

  useEffect(() => {
    const newMap = new Map(docs.map((doc) => [doc.id, doc]))
    const idsToClean: string[] = difference(
      [...currentDocumentsRef.current.keys()],
      [...newMap.keys()]
    )
    idsToClean.forEach(removeDocInSelection)
    currentDocumentsRef.current = newMap
  }, [docs, removeDocInSelection])

  useEffect(() => {
    const newMap = new Map((folders || []).map((folder) => [folder.id, folder]))
    const idsToClean: string[] = difference(
      [...currentFoldersRef.current.keys()],
      [...newMap.keys()]
    )
    idsToClean.forEach(removeFolderInSelection)
    currentFoldersRef.current = newMap
  }, [folders, removeFolderInSelection])

  const currentView = useMemo(() => {
    if (selectedViewId == null) {
      return undefined
    }

    return views.find((view) => view.id === selectedViewId)
  }, [selectedViewId, views])

  const toolbarColumns = useMemo(() => {
    if (currentView == null || currentView.type !== 'table') {
      return []
    }

    return sortTableViewColumns(currentView.data.columns || {})
  }, [currentView])

  const selectViewId = useCallback(
    (id: number) => {
      setSelectedViewId(id)
      resetDocsInSelection()
      resetFoldersInSelection()
    },
    [resetDocsInSelection, resetFoldersInSelection]
  )

  const viewsSelector = useMemo(() => {
    return (
      <Flexbox justifyContent='space-between' className='views__header'>
        <ViewsSelector
          selectedViewId={selectedViewId}
          setSelectedViewId={selectViewId}
          createViewApi={createViewApi}
          parent={parent}
          views={views}
        />
      </Flexbox>
    )
  }, [createViewApi, parent, views, selectedViewId, selectViewId])

  return (
    <Container>
      <Scroller className='view__scroller'>
        {viewsSelector}
        {currentView != null && (
          <>
            {currentView.type === 'table' ? (
              <TableView
                folders={folders}
                team={team}
                currentWorkspaceId={currentWorkspaceId}
                currentFolderId={currentFolderId}
                view={currentView}
                docs={docs}
                currentUserIsCoreMember={currentUserIsCoreMember}
                selectViewId={setSelectedViewId}
                addDocInSelection={addDocinSelection}
                hasDocInSelection={hasDocInSelection}
                toggleDocInSelection={toggleDocInSelection}
                resetDocsInSelection={resetDocsInSelection}
              />
            ) : null}
          </>
        )}

        <ViewsFolderList
          folders={folders}
          team={team}
          currentUserIsCoreMember={currentUserIsCoreMember}
          updating={updating}
          setUpdating={setUpdating}
          currentWorkspaceId={currentWorkspaceId}
          currentFolderId={currentFolderId}
          addFolderInSelection={addFolderInSelection}
          hasFolderInSelection={hasFolderInSelection}
          toggleFolderInSelection={toggleFolderInSelection}
          resetFoldersInSelection={resetFoldersInSelection}
        />
        <div className='views__placeholder' />
      </Scroller>

      {currentUserIsCoreMember && (
        <ContentManagerToolbar
          propsColumns={toolbarColumns}
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

const Container = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;

  .views__header {
    flex: 0 0 auto;
    width: 100%;
  }

  .view__scroller {
    height: 100%;
  }

  .views__placeholder {
    height: 40px;
    width: 100%;
  }

  .content__manager__list__header--margin {
    margin-top: ${({ theme }) => theme.sizes.spaces.df}px;
  }

  .content__manager__add-row {
    height: 40px;
    display: flex;
    align-items: center;
    padding: 0 ${({ theme }) => theme.sizes.spaces.xl}px;
    color: ${({ theme }) => theme.colors.text.subtle};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.second};
    width: 100%;

    button {
      padding: 0;
      justify-content: flex-start;
    }

    .form__toggable__input,
    button,
    input {
      width: 100%;
    }
  }
`
