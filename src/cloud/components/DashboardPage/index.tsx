import { mdiDotsHorizontal } from '@mdi/js'
import React, { useEffect, useRef } from 'react'
import { useModal } from '../../../design/lib/stores/modal'
import styled from '../../../design/lib/styled'
import { GetInitialPropsParameters } from '../../interfaces/pages'
import { usePage } from '../../lib/stores/pageStore'
import ApplicationContent from '../ApplicationContent'
import ApplicationPage from '../ApplicationPage'
import ApplicationTopbar from '../ApplicationTopbar'
import {
  DashboardShowPageResponseBody,
  getDashboardShowPageData,
} from '../../api/pages/teams/dashboards/show'
import { trackEvent } from '../../api/track'
import { MixpanelActionTrackTypes } from '../../interfaces/analytics/mixpanel'

const DashboardPage = ({
  dashboard: propsDashboard,
  smartViews: PropsSmartViews,
  team: propsTeam,
}: DashboardShowPageResponseBody) => {
  const dashboardRef = useRef<string | undefined>(undefined)
  const { openContextModal } = useModal()
  const { team } = usePage()

  useEffect(() => {
    if (dashboardRef.current === propsDashboard.id) {
      return
    }

    dashboardRef.current = propsDashboard.id
    trackEvent(MixpanelActionTrackTypes.DashboardOpen)
  }, [propsDashboard.id])

  return (
    <ApplicationPage>
      <ApplicationTopbar
        controls={[
          {
            type: 'button',
            variant: 'icon',
            iconPath: mdiDotsHorizontal,
            onClick: (_event) => {},
          },
        ]}
      />
      <ApplicationContent>
        <Container>in dashboard page</Container>
      </ApplicationContent>
    </ApplicationPage>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  height: 100%;

  .smartView__control {
    margin: ${({ theme }) => theme.sizes.spaces.df}px
      ${({ theme }) => theme.sizes.spaces.sm}px;
    font-size: ${({ theme }) => theme.sizes.fonts.xl}px;

    span {
      padding-right: ${({ theme }) => theme.sizes.spaces.sm}px;
      color: ${({ theme }) => theme.colors.text.primary};
    }
  }

  .views__list {
    flex: 1 1 auto;
    height: 100%;
  }

  .smartView__filters {
    padding-left: ${({ theme }) => theme.sizes.spaces.df}px;
  }
`

DashboardPage.getInitialProps = async (params: GetInitialPropsParameters) => {
  const result = await getDashboardShowPageData(params)
  return result
}

export default DashboardPage
