import React, { useMemo, useState } from 'react'
import Button from '../../../design/components/atoms/Button'
import Flexbox from '../../../design/components/atoms/Flexbox'
import { useModal } from '../../../design/lib/stores/modal'
import styled from '../../../design/lib/styled'
import { SerializedDocWithSupplemental } from '../../interfaces/db/doc'
import { SerializedView, ViewParent } from '../../interfaces/db/view'
import { useCloudApi } from '../../lib/hooks/useCloudApi'
import UpdateDashboardModal from '../Modal/contents/Dashboard/UpdateDashboardModal'
import TableView from './Table/TableView'
import ViewsSelector from './ViewsSelector'

interface ViewsListProps {
  views: SerializedView[]
  parent: ViewParent
  docs: SerializedDocWithSupplemental[]
  currentUserIsCoreMember: boolean
}

const ViewsList = ({
  views,
  parent,
  docs,
  currentUserIsCoreMember,
}: ViewsListProps) => {
  const [selectedViewId, setSelectedViewId] = useState<number | undefined>(() =>
    views.length > 0 ? views[0].id : undefined
  )
  const { createViewApi } = useCloudApi()
  const { openModal } = useModal()

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
          viewsSelector={
            <ViewsSelector
              selectedViewId={selectedViewId}
              setSelectedViewId={setSelectedViewId}
              createViewApi={createViewApi}
              parent={parent}
              views={views}
            />
          }
          filterButton={
            parent.type === 'dashboard' ? (
              <Button
                variant='transparent'
                active={parent.target.condition.length > 0}
                onClick={() =>
                  openModal(
                    <UpdateDashboardModal
                      dashboard={parent.target}
                      showOnlyConditions={true}
                    />
                  )
                }
              >
                Filter
              </Button>
            ) : null
          }
          view={currentView}
          docs={docs}
          currentUserIsCoreMember={currentUserIsCoreMember}
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
