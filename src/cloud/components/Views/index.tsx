import { isEqual } from 'lodash'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import Flexbox from '../../../design/components/atoms/Flexbox'
import styled from '../../../design/lib/styled'
import { SerializedDocWithSupplemental } from '../../interfaces/db/doc'
import { SerializedFolderWithBookmark } from '../../interfaces/db/folder'
import { SerializedTeam } from '../../interfaces/db/team'
import { SerializedView, ViewParent } from '../../interfaces/db/view'
import { SerializedWorkspace } from '../../interfaces/db/workspace'
import { useCloudApi } from '../../lib/hooks/useCloudApi'
import TableView from './Table/TableView'
import ViewsSelector from './ViewsSelector'

interface ViewsListProps {
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

const ViewsList = ({
  views,
  parent,
  docs,
  folders,
  workspacesMap,
  currentUserIsCoreMember,
  currentFolderId,
  currentWorkspaceId,
  team,
}: ViewsListProps) => {
  const targetIdRef = useRef(parent.target.id)
  const [selectedViewId, setSelectedViewId] = useState<number | undefined>(() =>
    views.length > 0 ? views[0].id : undefined
  )
  const { createViewApi } = useCloudApi()

  const selectedViewIdRef = useRef(selectedViewId)
  const viewsIdsRef = useRef(views.map((v) => v.id))

  useEffect(() => {
    selectedViewIdRef.current = selectedViewId
  }, [selectedViewId])

  useEffect(() => {
    if (parent.target.id === targetIdRef.current) {
      return
    }

    targetIdRef.current = parent.target.id
    setSelectedViewId(views.length > 0 ? views[0].id : undefined)
  }, [parent.target, views])

  useEffect(() => {
    const newViewsIds = views.map((v) => v.id)
    if (!isEqual(newViewsIds, viewsIdsRef.current)) {
      if (
        selectedViewIdRef.current != null &&
        !newViewsIds.includes(selectedViewIdRef.current)
      ) {
        setSelectedViewId(views.length > 0 ? views[0].id : undefined)
      }
      viewsIdsRef.current = newViewsIds
    }
  }, [views])

  const currentView = useMemo(() => {
    if (selectedViewId == null) {
      return undefined
    }

    return views.find((view) => view.id === selectedViewId)
  }, [selectedViewId, views])

  return (
    <Container className='views__list'>
      {selectedViewId == null && (
        <Flexbox justifyContent='space-between' className='views__header'>
          <ViewsSelector
            selectedViewId={selectedViewId}
            setSelectedViewId={setSelectedViewId}
            createViewApi={createViewApi}
            parent={parent}
            views={views}
          />
        </Flexbox>
      )}
      {currentView == null ? null : currentView.type === 'table' ? (
        <TableView
          workspacesMap={workspacesMap}
          folders={folders}
          team={team}
          currentWorkspaceId={currentWorkspaceId}
          currentFolderId={currentFolderId}
          view={currentView}
          docs={docs}
          currentUserIsCoreMember={currentUserIsCoreMember}
          selectViewId={setSelectedViewId}
        />
      ) : null}
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  width: 100%;
  height: 100%;

  .views__header {
    width: 100%;
  }
`

export default ViewsList
