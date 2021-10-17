import { mdiChevronDown, mdiPlus } from '@mdi/js'
import React, { useMemo, useState } from 'react'
import { useEffectOnce } from 'react-use'
import BorderSeparator from '../../../design/components/atoms/BorderSeparator'
import Button from '../../../design/components/atoms/Button'
import Flexbox from '../../../design/components/atoms/Flexbox'
import Icon from '../../../design/components/atoms/Icon'
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
import { useNav } from '../../lib/stores/nav'
import ApplicationContent from '../ApplicationContent'
import ApplicationPage from '../ApplicationPage'
import ApplicationTopbar from '../ApplicationTopbar'
import CreateDashboardModal from '../Modal/contents/Dashboard/CreateDashboardModal'

const DashboardPage = ({ data }: DashboardListPageResponseBody) => {
  const [selectedDashboardId, setSelectedDashboardId] = useState<
    string | undefined
  >(data.length > 0 ? data[0].id : undefined)
  const { initialLoadDone, dashboardsMap } = useNav()
  const { openModal, openContextModal } = useModal()

  useEffectOnce(() => {
    if (initialLoadDone && dashboardsMap.size > 0) {
      const dashboards = getMapValues(dashboardsMap)
      setSelectedDashboardId(dashboards[0].id)
    }
  })

  const selectedDashboard = useMemo(() => {
    if (selectedDashboardId == null) {
      return undefined
    }

    return dashboardsMap.get(selectedDashboardId)
  }, [dashboardsMap, selectedDashboardId])

  return (
    <ApplicationPage>
      <ApplicationTopbar controls={[]} />
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
                    selectDashboard={setSelectedDashboardId}
                    selectedDashboardId={selectedDashboardId}
                    createNewDashboard={() =>
                      openModal(<CreateDashboardModal />)
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
        </Container>
      </ApplicationContent>
    </ApplicationPage>
  )
}

const DashboardSelector = ({
  selectedDashboardId,
  selectDashboard,
  createNewDashboard,
}: {
  selectedDashboardId?: string
  createNewDashboard: () => void
  selectDashboard: React.Dispatch<React.SetStateAction<string | undefined>>
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
            active={dashboard.id === selectedDashboardId}
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

  .dashboard__control {
    margin: ${({ theme }) => theme.sizes.spaces.df}px
      ${({ theme }) => theme.sizes.spaces.sm}px;
    font-size: ${({ theme }) => theme.sizes.fonts.l}px;

    span {
      padding-right: ${({ theme }) => theme.sizes.spaces.sm}px;
    }
  }
`

const DashboardSelectorContainer = styled.div``

DashboardPage.getInitialProps = async (params: GetInitialPropsParameters) => {
  const result = await getDashboardListPageData(params)
  return result
}

export default DashboardPage
