import React, { useEffect, useMemo, useRef, useState } from 'react'
import styled from '../../../../design/lib/styled'
import { SerializedDocWithSupplemental } from '../../../interfaces/db/doc'
import { SerializedView } from '../../../interfaces/db/view'
import { ViewTableData } from '../../../lib/views/table'
import { SerializedTeam } from '../../../interfaces/db/team'
import { overflowEllipsis } from '../../../../design/lib/styled/styleFunctions'
import { SerializedWorkspace } from '../../../interfaces/db/workspace'
import Scroller from '../../../../design/components/atoms/Scroller'
import { useTableView } from '../../../lib/hooks/views/tableView'
import { SerializedFolderWithBookmark } from '../../../interfaces/db/folder'
import TableViewContentManager from './TableViewContentManager'
import { buildSmartViewQueryCheck } from '../../../lib/smartViews'

type TableViewProps = {
  view: SerializedView
  docs: SerializedDocWithSupplemental[]
  folders?: SerializedFolderWithBookmark[]
  team: SerializedTeam
  workspacesMap: Map<string, SerializedWorkspace>
  currentUserIsCoreMember: boolean
  currentWorkspaceId?: string
  currentFolderId?: string
  selectViewId: (viewId: number) => void
}

const TableView = ({
  view,
  docs,
  workspacesMap,
  currentUserIsCoreMember,
  folders,
  currentWorkspaceId,
  currentFolderId,
  team,
  selectViewId,
}: TableViewProps) => {
  const currentStateRef = useRef(view.data)
  const [state, setState] = useState<ViewTableData>(
    Object.assign({}, view.data as ViewTableData)
  )

  const filteredDocs = useMemo(() => {
    if (state.filter == null || state.filter.length === 0) {
      return docs
    }

    return docs.filter(buildSmartViewQueryCheck(state.filter))
  }, [state.filter, docs])

  const { actionsRef } = useTableView({
    view,
    state,
    selectNewView: selectViewId,
  })

  useEffect(() => {
    currentStateRef.current = Object.assign({}, view.data)
  }, [view.data])

  useEffect(() => {
    setState(Object.assign({}, view.data as ViewTableData))
  }, [view.data])

  return (
    <Container>
      <Scroller className='view__scroller'>
        <TableViewContentManager
          team={team}
          documents={filteredDocs}
          folders={folders}
          workspacesMap={workspacesMap}
          currentUserIsCoreMember={currentUserIsCoreMember}
          tableActionsRef={actionsRef}
          view={view}
          currentFolderId={currentFolderId}
          currentWorkspaceId={currentWorkspaceId}
        />
      </Scroller>
    </Container>
  )
}

const Container = styled.div`
  width: 100%;
  height: 100%;

  .view__scroller {
    height: 100%;
    padding: ${({ theme }) => theme.sizes.spaces.xsm}px 0;
  }

  .views__header {
    width: 100%;
    margin-bottom: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  .react-datepicker-popper {
    z-index: 2;
  }

  .navigation__item {
    height: 100%;
  }

  .table__col {
    .th__cell {
      .th__cell__icon {
        margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;
        color: ${({ theme }) => theme.colors.text.subtle};
        flex: 0 0 auto;
      }

      span {
        ${overflowEllipsis()}
      }
    }
  }

  .static__dates {
    height: 100%;
    justify-content: center;
    color: ${({ theme }) => theme.colors.text.subtle};
  }

  .table__row__cell > *,
  .table__row__cell .react-datepicker-wrapper,
  .table__row__cell .react-datepicker__input-container {
    height: 100%;
  }

  .doc__tags__icon {
    display: none;
  }

  .table__row__cell {
    .item__property__button,
    .react-datepicker-wrapper {
      width: 100%;
      border-radius: 0 !important;
    }
    .item__property__button {
      padding: 16px ${({ theme }) => theme.sizes.spaces.sm}px;
      height: 100% !important;
      min-height: 32px;
      border: 0 !important;
    }

    .doc__tags__list__item {
      margin-top: ${({ theme }) => theme.sizes.spaces.xsm}px !important;
      margin-bottom: ${({ theme }) => theme.sizes.spaces.xsm}px !important;
    }
  }

  .doc__tags__wrapper--empty,
  .doc__tags__create--empty {
    height: 100%;
    margin: 0 !important;
    width: 100%;
  }
`

export default TableView
