import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useSet } from 'react-use'
import { difference } from 'lodash'
import styled from '../../../design/lib/styled'
import { SerializedDocWithSupplemental } from '../../interfaces/db/doc'
import { SerializedFolderWithBookmark } from '../../interfaces/db/folder'
import ContentManagerToolbar from '../ContentManager/ContentManagerToolbar'
import ViewsSelector from './ViewsSelector'
import { sortTableViewColumns } from '../../lib/views/table'
import { SerializedView, ViewParent } from '../../interfaces/db/view'
import { SerializedWorkspace } from '../../interfaces/db/workspace'
import { SerializedTeam } from '../../interfaces/db/team'
import TableView from './Table/TableView'
import FolderList from './FolderList'
import Scroller from '../../../design/components/atoms/Scroller'
import { sortByLexorankProperty } from '../../lib/utils/string'
import CalendarView from './Calendar/CalendarView'
import KanbanView from './Kanban'
import ListView from './List'
import { sortListViewProps } from '../../lib/views/list'
import { useRouter } from '../../lib/router'

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
    views.length > 0 ? sortByLexorankProperty(views, 'order')[0].id : undefined
  )
  const [updating, setUpdating] = useState<string[]>([])
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

  const { query, push, pathname } = useRouter()

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
    if (!query || typeof query.view !== 'string') {
      return
    }
    if (Number.isNaN(query.view)) {
      return
    }
    const viewId = parseInt(query.view)
    const viewToLoad = views.find((view) => view.id === viewId)
    if (viewToLoad != null) {
      setSelectedViewId(viewToLoad.id)
    }
  }, [query, views])

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
    if (selectedViewId == null || views.length === 0) {
      return undefined
    }

    const index = views.findIndex((view) => view.id === selectedViewId)
    if (index !== -1) {
      return views[index]
    }

    return sortByLexorankProperty(views, 'order')[0]
  }, [selectedViewId, views])

  const toolbarColumns = useMemo(() => {
    if (
      currentView == null ||
      !(currentView.type === 'table' || currentView.type === 'list')
    ) {
      return []
    }

    if (currentView.type === 'table') {
      return sortTableViewColumns(currentView.data.columns || {})
    }

    return sortListViewProps(currentView.data.props)
  }, [currentView])

  const selectViewId = useCallback(
    (id: number) => {
      push(`${pathname}?view=${id}`)

      setSelectedViewId(id)
      resetDocsInSelection()
      resetFoldersInSelection()
    },
    [pathname, push, resetDocsInSelection, resetFoldersInSelection]
  )

  const viewsSelector = useMemo(() => {
    return (
      <ViewsSelector
        selectedViewId={currentView != null ? currentView.id : undefined}
        setSelectedViewId={selectViewId}
        parent={parent}
        views={views}
      />
    )
  }, [parent, views, currentView, selectViewId])

  return (
    <Container>
      <Scroller className='view__scroller'>
        {currentView != null && (
          <>
            {currentView.type === 'list' ? (
              <ListView
                viewsSelector={viewsSelector}
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
                addFolderInSelection={addFolderInSelection}
                hasFolderInSelection={hasFolderInSelection}
                toggleFolderInSelection={toggleFolderInSelection}
                folders={folders}
                updating={updating}
                setUpdating={setUpdating}
                resetFoldersInSelection={resetFoldersInSelection}
              />
            ) : currentView.type === 'table' ? (
              <TableView
                viewsSelector={viewsSelector}
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
            ) : currentView.type === 'kanban' ? (
              <KanbanView
                viewsSelector={viewsSelector}
                team={team}
                view={currentView}
                currentUserIsCoreMember={currentUserIsCoreMember}
                docs={docs}
                currentFolderId={currentFolderId}
                currentWorkspaceId={currentWorkspaceId}
              />
            ) : currentView.type === 'calendar' ? (
              <CalendarView
                view={currentView}
                viewsSelector={viewsSelector}
                docs={docs}
                team={team}
                currentUserIsCoreMember={currentUserIsCoreMember}
                currentFolderId={currentFolderId}
                currentWorkspaceId={currentWorkspaceId}
              />
            ) : null}
          </>
        )}

        {currentView != null && currentView.type !== 'list' && (
          <FolderList
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
        )}
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

    width: 100%;

    &:not(.content__manager__add-row--folder) {
      border-bottom: 1px solid ${({ theme }) => theme.colors.border.second};
    }

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
