import React, { useMemo, useState } from 'react'
import Flexbox from '../../../design/components/atoms/Flexbox'
import styled from '../../../design/lib/styled'
import { SerializedView } from '../../interfaces/db/view'
import { useCloudApi } from '../../lib/hooks/useCloudApi'
import TableView from './Table/TableView'
import ViewsSelector from './ViewsSelector'

interface ViewsListProps {
  views: SerializedView[]
  parent: { folder: string } | { dashboard: string }
}

const ViewsList = ({ views, parent }: ViewsListProps) => {
  const [selectedViewId, setSelectedViewId] = useState<number | undefined>(() =>
    views.length > 0 ? views[0].id : undefined
  )
  const { createViewApi } = useCloudApi()

  const currentView = useMemo(() => {
    if (selectedViewId == null) {
      return undefined
    }

    return views.find((view) => view.id === selectedViewId)
  }, [selectedViewId, views])

  return (
    <Container className='views__list'>
      {currentView == null ? (
        <Flexbox justifyContent='space-between' className='views__header'>
          <ViewsSelector
            selectedViewId={selectedViewId}
            setSelectedViewId={setSelectedViewId}
            createViewApi={createViewApi}
            parent={parent}
            views={views}
          />
        </Flexbox>
      ) : currentView.type === 'table' ? (
        <TableView
          selectedViewId={selectedViewId}
          setSelectedViewId={setSelectedViewId}
          createViewApi={createViewApi}
          parent={parent}
          views={views}
          view={currentView}
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

  .views__header {
    width: 100%;
  }
`

export default ViewsList
