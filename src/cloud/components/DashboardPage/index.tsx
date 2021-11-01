import { mdiChevronDown, mdiDotsHorizontal, mdiPlus } from '@mdi/js'
import React, { useMemo, useState } from 'react'
import { useEffectOnce } from 'react-use'
import BorderSeparator from '../../../design/components/atoms/BorderSeparator'
import Button from '../../../design/components/atoms/Button'
import Flexbox from '../../../design/components/atoms/Flexbox'
import Icon from '../../../design/components/atoms/Icon'
import Spinner from '../../../design/components/atoms/Spinner'
import UpDownList from '../../../design/components/atoms/UpDownList'
import NavigationItem from '../../../design/components/molecules/Navigation/NavigationItem'
import { useModal } from '../../../design/lib/stores/modal'
import styled from '../../../design/lib/styled'
import { getMapValues } from '../../../design/lib/utils/array'
import {
  DashboardListPageResponseBody,
  getDashboardListPageData,
} from '../../api/pages/teams/dashboard/list'
import { GetInitialPropsParameters } from '../../interfaces/pages'
import { buildDashboardQueryCheck } from '../../lib/dashboards'
import { useCloudApi } from '../../lib/hooks/useCloudApi'
import { useNav } from '../../lib/stores/nav'
import { usePage } from '../../lib/stores/pageStore'
import ApplicationContent from '../ApplicationContent'
import ApplicationPage from '../ApplicationPage'
import ApplicationTopbar from '../ApplicationTopbar'
import DashboardFolderContextMenu from '../DashboardFolderContextMenu'
import CreateDashboardModal from '../Modal/contents/Dashboard/CreateDashboardModal'
import Views from '../Views'

const DashboardPage = ({ data }: DashboardListPageResponseBody) => {
  const [selectedDashboardId, setSelectedDashboardId] = useState<
    string | undefined
  >(data.length > 0 ? data[0].id : undefined)
  const { initialLoadDone, dashboardsMap, docsMap, viewsMap } = useNav()
  const { openModal, openContextModal, closeAllModals } = useModal()
  const { team } = usePage()
  const { listViewsApi, sendingMap } = useCloudApi()

  useEffectOnce(() => {
    if (initialLoadDone && dashboardsMap.size > 0) {
      const dashboards = getMapValues(dashboardsMap)
      setSelectedDashboardId(dashboards[0].id)
      listViewsApi({ dashboard: dashboards[0].id })
    }
  })

  const selectedDashboard = useMemo(() => {
    if (selectedDashboardId == null) {
      return undefined
    }

    return dashboardsMap.get(selectedDashboardId)
  }, [dashboardsMap, selectedDashboardId])

  const selectedDashboardViews = useMemo(() => {
    if (selectedDashboard == null) {
      return []
    }

    const views = getMapValues(viewsMap)

    return views.filter((view) => view.dashboardId === selectedDashboard.id)
  }, [viewsMap, selectedDashboard])

  const selectedDashboardDocs = useMemo(() => {
    if (selectedDashboard == null || selectedDashboard.condition.length === 0) {
      return []
    }
    const docs = getMapValues(docsMap)

    return docs.filter(buildDashboardQueryCheck(selectedDashboard.condition))
  }, [docsMap, selectedDashboard])

  return (
    <ApplicationPage>
      <ApplicationTopbar
        controls={
          selectedDashboard == null || team == null
            ? []
            : [
                {
                  type: 'button',
                  variant: 'icon',
                  iconPath: mdiDotsHorizontal,
                  onClick: (event) =>
                    openContextModal(
                      event,
                      <DashboardFolderContextMenu
                        dashboard={selectedDashboard}
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
        <Container>
          <Flexbox>
            <Button
              variant='transparent'
              className='dashboard__control'
              onClick={(event) => {
                openContextModal(
                  event,
                  <DashboardSelector
                    selectDashboard={(id) => {
                      setSelectedDashboardId(id)
                      listViewsApi({ dashboard: id })
                      closeAllModals()
                    }}
                    selectedDashboardId={selectedDashboardId}
                    createNewDashboard={() =>
                      openModal(
                        <CreateDashboardModal
                          onCreate={(dashboard) =>
                            setSelectedDashboardId(dashboard.id)
                          }
                        />
                      )
                    }
                  />,
                  {
                    alignment: 'right',
                    width: 250,
                  }
                )
              }}
            >
              <span>
                {selectedDashboard != null
                  ? selectedDashboard.name
                  : 'Dashboards'}
              </span>
              <Icon path={mdiChevronDown} />
            </Button>
          </Flexbox>
          {selectedDashboard != null ? (
            <>
              {sendingMap.get(selectedDashboard.id) === 'list-views' ? (
                <Spinner />
              ) : (
                <Views
                  views={selectedDashboardViews}
                  parent={{ type: 'dashboard', target: selectedDashboard }}
                  docs={selectedDashboardDocs}
                />
              )}
            </>
          ) : null}
        </Container>
      </ApplicationContent>
    </ApplicationPage>
  )
}

const DashboardSelector = ({
  selectDashboard,
  createNewDashboard,
}: {
  selectedDashboardId?: string
  createNewDashboard: () => void
  selectDashboard: (id: string) => void
}) => {
  const { dashboardsMap } = useNav()

  const dashboards = useMemo(() => {
    return getMapValues(dashboardsMap)
  }, [dashboardsMap])

  return (
    <DashboardSelectorContainer>
      <UpDownList>
        {dashboards.map((dashboard) => (
          <NavigationItem
            id={`dashboard__selector--${dashboard.id}`}
            borderRadius={true}
            key={dashboard.id}
            label={dashboard.name}
            labelClick={() => selectDashboard(dashboard.id)}
          />
        ))}

        {dashboards.length > 0 && <BorderSeparator variant='second' />}
        <Button
          variant='transparent'
          iconPath={mdiPlus}
          onClick={createNewDashboard}
          id='new-dashboard'
        >
          Add new Dashboard
        </Button>
      </UpDownList>
    </DashboardSelectorContainer>
  )
}

const Container = styled.div`
  margin: 0 ${({ theme }) => theme.sizes.spaces.df}px;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;

  .dashboard__control {
    margin: ${({ theme }) => theme.sizes.spaces.df}px
      ${({ theme }) => theme.sizes.spaces.sm}px;
    font-size: ${({ theme }) => theme.sizes.fonts.xl}px;

    span {
      padding-right: ${({ theme }) => theme.sizes.spaces.sm}px;
      color: ${({ theme }) => theme.colors.text.primary};
    }
  }
`

const DashboardSelectorContainer = styled.div``

DashboardPage.getInitialProps = async (params: GetInitialPropsParameters) => {
  const result = await getDashboardListPageData(params)
  return result
}

export default DashboardPage
