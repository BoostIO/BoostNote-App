import React from 'react'
import styled from '../../../design/lib/styled'
import { getDashboardListPageData } from '../../api/pages/teams/dashboard/list'
import { GetInitialPropsParameters } from '../../interfaces/pages'
import ApplicationContent from '../ApplicationContent'
import ApplicationPage from '../ApplicationPage'
import ApplicationTopbar from '../ApplicationTopbar'

const DashboardPage = () => {
  return (
    <ApplicationPage>
      <ApplicationTopbar controls={[]} />
      <ApplicationContent>
        <Container>
          <h1>Dashboard</h1>
        </Container>
      </ApplicationContent>
    </ApplicationPage>
  )
}

const Container = styled.div`
  margin: 0 ${({ theme }) => theme.sizes.spaces.df}px;
`

DashboardPage.getInitialProps = async (params: GetInitialPropsParameters) => {
  const result = await getDashboardListPageData(params)
  return result
}

export default DashboardPage
