/* eslint-disable @typescript-eslint/no-empty-function */
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useSet } from 'react-use'
import { difference } from 'lodash'
import styled from '../../../design/lib/styled'
import { SerializedDocWithSupplemental } from '../../interfaces/db/doc'
import { sortTableViewColumns } from '../../lib/views/table'
import { SerializedView } from '../../interfaces/db/view'
import { SerializedTeam } from '../../interfaces/db/team'
import Scroller from '../../../design/components/atoms/Scroller'
import { sortListViewProps } from '../../lib/views/list'
import ListView from '../Views/List'
import TableView from '../Views/Table/TableView'
import KanbanView from '../Views/Kanban'
import CalendarView from '../Views/Calendar/CalendarView'
import { useNav } from '../../lib/stores/nav'
import ContentManagerToolbar from '../ContentManager/ContentManagerToolbar'

type DashboardViewProps = {
  view: SerializedView
  docs: SerializedDocWithSupplemental[]
  currentUserIsCoreMember: boolean
  team: SerializedTeam
}

export const DashboardView = ({
  view: currentView,
  team,
  docs,
  currentUserIsCoreMember,
}: DashboardViewProps) => {
  const [updating, setUpdating] = useState<string[]>([])
  const { foldersMap, workspacesMap } = useNav()
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

  const currentDocumentsRef = useRef(
    new Map<string, SerializedDocWithSupplemental>(
      docs.map((doc) => [doc.id, doc])
    )
  )
  useEffect(() => {
    const newMap = new Map(docs.map((doc) => [doc.id, doc]))
    const idsToClean: string[] = difference(
      [...currentDocumentsRef.current.keys()],
      [...newMap.keys()]
    )
    idsToClean.forEach(removeDocInSelection)
    currentDocumentsRef.current = newMap
  }, [docs, removeDocInSelection])

  const toolbarColumns = useMemo(() => {
    switch (currentView?.type) {
      case 'table':
        return sortTableViewColumns(currentView.data.columns || {})
      case 'list':
        return sortListViewProps(currentView.data.props)
      default:
        return []
    }
  }, [currentView])

  return (
    <Container>
      <Scroller className='view__scroller'>
        {currentView != null && (
          <>
            {currentView.type === 'list' ? (
              <ListView
                viewsSelector={<div />}
                team={team}
                view={currentView}
                docs={docs}
                currentUserIsCoreMember={currentUserIsCoreMember}
                selectViewId={() => {}}
                addDocInSelection={addDocinSelection}
                hasDocInSelection={hasDocInSelection}
                toggleDocInSelection={toggleDocInSelection}
                resetDocsInSelection={resetDocsInSelection}
                addFolderInSelection={() => {}}
                hasFolderInSelection={() => false}
                toggleFolderInSelection={() => {}}
                resetFoldersInSelection={() => {}}
                updating={updating}
                setUpdating={setUpdating}
              />
            ) : currentView.type === 'table' ? (
              <TableView
                viewsSelector={<div />}
                team={team}
                view={currentView}
                docs={docs}
                currentUserIsCoreMember={currentUserIsCoreMember}
                selectViewId={() => {}}
                addDocInSelection={addDocinSelection}
                hasDocInSelection={hasDocInSelection}
                toggleDocInSelection={toggleDocInSelection}
                resetDocsInSelection={resetDocsInSelection}
              />
            ) : currentView.type === 'kanban' ? (
              <KanbanView
                viewsSelector={<div />}
                team={team}
                view={currentView}
                currentUserIsCoreMember={currentUserIsCoreMember}
                docs={docs}
              />
            ) : currentView.type === 'calendar' ? (
              <CalendarView
                view={currentView}
                viewsSelector={<div />}
                docs={docs}
                team={team}
                currentUserIsCoreMember={currentUserIsCoreMember}
              />
            ) : null}
          </>
        )}
        <div className='views__placeholder' />
      </Scroller>

      {currentUserIsCoreMember && (
        <ContentManagerToolbar
          propsColumns={toolbarColumns}
          selectedDocs={selectedDocSet}
          selectedFolders={new Set()}
          documentsMap={currentDocumentsRef.current}
          foldersMap={foldersMap}
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
