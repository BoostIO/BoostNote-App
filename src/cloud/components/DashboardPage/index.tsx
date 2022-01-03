import { mdiDotsHorizontal } from '@mdi/js'
import React, { useCallback, useEffect, useRef } from 'react'
import { useModal } from '../../../design/lib/stores/modal'
import styled from '../../../design/lib/styled'
import { GetInitialPropsParameters } from '../../interfaces/pages'
import ApplicationContent from '../ApplicationContent'
import ApplicationPage from '../ApplicationPage'
import ApplicationTopbar from '../ApplicationTopbar'
import {
  DashboardShowPageResponseBody,
  getDashboardShowPageData,
} from '../../api/pages/teams/dashboards/show'
import { trackEvent } from '../../api/track'
import { MixpanelActionTrackTypes } from '../../interfaces/analytics/mixpanel'
import DashboardContextMenu from './DashboardContextMenu'
import AddSmartViewModal from './AddSmartViewModal'
import { useDashboard } from '../../lib/hooks/dashboards/useDashboard'
import ColoredBlock from '../../../design/components/atoms/ColoredBlock'
import GridLayout from '../../../design/components/organisms/GridLayout'
import { SerializedSmartView } from '../../interfaces/db/smartView'
import SmartViewGridItem, {
  SmartViewGridItemControls,
  SmartViewModalItemControls,
} from './SmartViewGridItem'
import { usePage } from '../../lib/stores/pageStore'

const DashboardPage = ({
  dashboard: propsDashboard,
  smartViews: propsSmartViews,
  team: propsTeam,
}: DashboardShowPageResponseBody) => {
  const dashboardRef = useRef<string | undefined>(undefined)
  const { openContextModal, openModal, closeAllModals } = useModal()
  const {
    dashboard,
    actionsRef,
    smartViews,
    sendingMap,
    dashboardData,
  } = useDashboard({
    dashboard: propsDashboard,
    smartViews: propsSmartViews,
    team: propsTeam,
  })
  const { currentUserIsCoreMember } = usePage()

  useEffect(() => {
    if (dashboardRef.current === propsDashboard.id) {
      return
    }

    dashboardRef.current = propsDashboard.id
    trackEvent(MixpanelActionTrackTypes.DashboardOpen)
  }, [propsDashboard.id])

  const renderSmartview = useCallback(
    (smartview: SerializedSmartView) => {
      return (
        <SmartViewGridItem
          team={propsTeam}
          smartview={smartview}
          currentUserIsCoreMember={currentUserIsCoreMember}
          controls={
            <SmartViewGridItemControls
              state={sendingMap.get(smartview.id)}
              onEdit={() => {}}
              onExpand={() =>
                openModal(
                  <SmartViewGridItem
                    team={propsTeam}
                    smartview={smartview}
                    currentUserIsCoreMember={currentUserIsCoreMember}
                    controls={
                      <SmartViewModalItemControls
                        state={sendingMap.get(smartview.id)}
                        onDelete={() => {
                          actionsRef.current
                            .removeSmartView(smartview)
                            .then(closeAllModals)
                        }}
                        onClose={closeAllModals}
                        onEdit={() => {}}
                      />
                    }
                  />,
                  {
                    showCloseIcon: false,
                    width: 'full',
                  }
                )
              }
              onDelete={() => actionsRef.current.removeSmartView(smartview)}
            />
          }
        />
      )
    },
    [currentUserIsCoreMember, propsTeam, sendingMap, actionsRef]
  )

  if (dashboard == null) {
    return (
      <ApplicationPage showingTopbarPlaceholder={true}>
        <ApplicationContent reduced={true}>
          <ColoredBlock variant='danger'>
            {'Dashboard has been removed'}
          </ColoredBlock>
        </ApplicationContent>
      </ApplicationPage>
    )
  }

  return (
    <ApplicationPage>
      <ApplicationTopbar
        controls={[
          {
            type: 'button',
            variant: 'primary',
            label: 'Add smart view',
            onClick: () =>
              openModal(
                <AddSmartViewModal
                  teamId={propsTeam.id}
                  addSmartView={actionsRef.current.addSmartView}
                />
              ),
          },
          {
            type: 'button',
            variant: 'icon',
            iconPath: mdiDotsHorizontal,
            onClick: (event) =>
              openContextModal(
                event,
                <DashboardContextMenu team={propsTeam} dashboard={dashboard} />,
                {
                  alignment: 'bottom-right',
                  removePadding: true,
                  hideBackground: true,
                }
              ),
          },
        ]}
      />
      <ApplicationContent>
        <Container className='dashboard__grid__wrapper'>
          <GridLayout
            className='dashboard__grid'
            items={smartViews}
            renderItem={renderSmartview}
            layout={dashboardData.itemsLayouts}
            updateLayout={actionsRef.current.updateDashboardLayout}
            defaultGridItemProperties={{
              isResizable: true,
              isDraggable: true,
              isBounded: true,
              resizeHandles: ['se'],
            }}
          />
        </Container>
      </ApplicationContent>
    </ApplicationPage>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  height: 100%;
`

DashboardPage.getInitialProps = async (params: GetInitialPropsParameters) => {
  const result = await getDashboardShowPageData(params)
  return result
}

export default DashboardPage
