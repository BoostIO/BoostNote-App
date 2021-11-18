import React, { useEffect, useMemo, useRef, useState } from 'react'
import styled from '../../../../design/lib/styled'
import { SerializedDocWithSupplemental } from '../../../interfaces/db/doc'
import { SerializedView } from '../../../interfaces/db/view'
import { ViewTableData } from '../../../lib/views/table'
import { SerializedTeam } from '../../../interfaces/db/team'
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
`

export default TableView
