import { mdiDotsHorizontal } from '@mdi/js'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useModal } from '../../../design/lib/stores/modal'
import styled from '../../../design/lib/styled'
import { GetInitialPropsParameters } from '../../interfaces/pages'
import { useNav } from '../../lib/stores/nav'
import { usePage } from '../../lib/stores/pageStore'
import ApplicationContent from '../ApplicationContent'
import ApplicationPage from '../ApplicationPage'
import ApplicationTopbar from '../ApplicationTopbar'
import SmartViewFolderContextMenu from '../SmartViewContextMenu'
import {
  getDashboardListPageData,
  DashboardListPageResponseBody,
} from '../../api/pages/teams/dashboards/list'
import { trackEvent } from '../../api/track'
import { MixpanelActionTrackTypes } from '../../interfaces/analytics/mixpanel'

const DashboardPage = ({
  data,
  team: propsTeam,
}: DashboardListPageResponseBody) => {
  const [selectedSmartViewId, setSelectedSmartViewId] = useState<string>()
  const { smartViewsMap } = useNav()
  const { openContextModal } = useModal()
  const { team } = usePage()
  const teamRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (teamRef.current === propsTeam.id) {
      return
    }

    teamRef.current = propsTeam.id
    if (data.length > 0) {
      setSelectedSmartViewId(data[0].id)
    } else {
      setSelectedSmartViewId(undefined)
    }
  }, [data, propsTeam])

  useEffect(() => {
    trackEvent(MixpanelActionTrackTypes.DashboardOpen)
  }, [selectedSmartViewId])

  const selectedSmartView = useMemo(() => {
    if (selectedSmartViewId == null) {
      return undefined
    }

    return smartViewsMap.get(selectedSmartViewId)
  }, [smartViewsMap, selectedSmartViewId])

  return (
    <ApplicationPage>
      <ApplicationTopbar
        controls={
          selectedSmartView == null || team == null
            ? []
            : [
                {
                  type: 'button',
                  variant: 'icon',
                  iconPath: mdiDotsHorizontal,
                  onClick: (event) =>
                    openContextModal(
                      event,
                      <SmartViewFolderContextMenu
                        smartView={selectedSmartView}
                        team={team}
                      />,
                      {
                        alignment: 'bottom-right',
                        removePadding: true,
                        hideBackground: true,
                      }
                    ),
                },
              ]
        }
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
  const result = await getDashboardListPageData(params)
  return result
}

export default DashboardPage
