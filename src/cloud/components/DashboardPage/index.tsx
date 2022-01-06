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
import UpdateSmartViewModal from './UpdateSmartViewModal'
import {
  freePlanDashboardPerUserPerTeamLimit,
  freePlanSmartViewPerDashboardLimit,
} from '../../lib/subscription'
import UnlockDashboardModal from '../Modal/contents/Subscription/UnlockDashboardModal'
import { useNav } from '../../lib/stores/nav'
import DashboardSubscriptionBanner from './DashboardSubscriptionBanner'

const DashboardPage = ({
  dashboard: propsDashboard,
  smartViews: propsSmartViews,
  team: propsTeam,
  subscription: propsSubscription,
}: DashboardShowPageResponseBody) => {
  const dashboardRef = useRef<string | undefined>(undefined)
  const dashboardSubRef = useRef<string | undefined>(undefined)
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
  const { dashboardsMap, initialLoadDone } = useNav()
  const { currentUserIsCoreMember, subscription } = usePage()

  useEffect(() => {
    if (dashboardRef.current === propsDashboard.id) {
      return
    }

    dashboardRef.current = propsDashboard.id
    trackEvent(MixpanelActionTrackTypes.DashboardOpen)
  }, [propsDashboard.id])

  useEffect(() => {
    if (!initialLoadDone || dashboardSubRef.current === propsDashboard.id) {
      return
    }

    dashboardSubRef.current = propsDashboard.id
    if (propsSubscription != null) {
      return
    }

    if (dashboardsMap.size > freePlanDashboardPerUserPerTeamLimit) {
      openModal(<UnlockDashboardModal />, {
        showCloseIcon: false,
        width: 'small',
      })
    }
  }, [
    initialLoadDone,
    propsDashboard.id,
    propsSubscription,
    dashboardsMap.size,
    openModal,
  ])

  const renderSmartview = useCallback(
    (smartview: SerializedSmartView) => {
      return (
        <SmartViewGridItem
          team={propsTeam}
          smartview={smartview}
          useScroller={true}
          currentUserIsCoreMember={currentUserIsCoreMember}
          controls={
            <SmartViewGridItemControls
              state={sendingMap.get(smartview.id)}
              onEdit={() =>
                openModal(
                  <UpdateSmartViewModal
                    teamId={propsTeam.id}
                    smartView={smartview}
                    save={(body) =>
                      actionsRef.current.updateSmartView(smartview, body)
                    }
                  />,
                  {
                    showCloseIcon: false,
                    width: 'full',
                  }
                )
              }
              onExpand={() =>
                openModal(
                  <SmartViewGridItem
                    team={propsTeam}
                    smartview={smartview}
                    currentUserIsCoreMember={currentUserIsCoreMember}
                    showControls={true}
                    controls={
                      <SmartViewModalItemControls
                        state={sendingMap.get(smartview.id)}
                        onDelete={() => {
                          actionsRef.current
                            .removeSmartView(smartview)
                            .then(closeAllModals)
                        }}
                        onClose={closeAllModals}
                        onEdit={() =>
                          openModal(
                            <UpdateSmartViewModal
                              teamId={propsTeam.id}
                              smartView={smartview}
                              save={(body) =>
                                actionsRef.current.updateSmartView(
                                  smartview,
                                  body
                                )
                              }
                            />,
                            {
                              showCloseIcon: false,
                              width: 'full',
                            }
                          )
                        }
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
    [
      currentUserIsCoreMember,
      propsTeam,
      sendingMap,
      actionsRef,
      closeAllModals,
      openModal,
    ]
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
            onClick: () => {
              if (
                subscription == null &&
                smartViews.length >= freePlanSmartViewPerDashboardLimit
              ) {
                return openModal(<UnlockDashboardModal type='smartview' />, {
                  showCloseIcon: false,
                  width: 'small',
                })
              }

              return openModal(
                <AddSmartViewModal
                  teamId={propsTeam.id}
                  addSmartView={actionsRef.current.addSmartView}
                />
              )
            },
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
          <DashboardSubscriptionBanner
            overLimit={
              subscription == null &&
              dashboardsMap.size > freePlanDashboardPerUserPerTeamLimit
            }
          />
          <GridLayout
            className='dashboard__grid'
            items={smartViews}
            renderItem={renderSmartview}
            layout={dashboardData.itemsLayouts}
            updateLayout={actionsRef.current.updateDashboardLayout}
            draggableCancel={'.sv__item__content'}
            disabled={
              subscription == null &&
              dashboardsMap.size > freePlanDashboardPerUserPerTeamLimit
            }
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

  .dashboard__grid {
    background: ${({ theme }) => theme.colors.background.secondary};
  }
`

DashboardPage.getInitialProps = async (params: GetInitialPropsParameters) => {
  const result = await getDashboardShowPageData(params)
  return result
}

export default DashboardPage
