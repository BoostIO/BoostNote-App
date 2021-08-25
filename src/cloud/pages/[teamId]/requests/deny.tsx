import React from 'react'
import { useTitle } from 'react-use'
import { GetInitialPropsParameters } from '../../../interfaces/pages'
import InviteCTAButton from '../../../components/buttons/InviteCTAButton'
import {
  getRequestDeniedPageData,
  RequestDeniedResponseBody,
} from '../../../api/pages/teams/requests'
import styled from '../../../../design/lib/styled'
import Banner from '../../../../design/components/atoms/Banner'
import ApplicationTopbar from '../../../components/ApplicationTopbar'
import ApplicationPage from '../../../components/ApplicationPage'
import ApplicationContent from '../../../components/ApplicationContent'

const DenyRequestsPage = ({}: RequestDeniedResponseBody) => {
  useTitle('Deny Edit Request')

  return (
    <ApplicationPage showingTopbarPlaceholder={true}>
      <ApplicationTopbar
        controls={[
          {
            type: 'node',
            element: <InviteCTAButton key='invite-cta' />,
          },
        ]}
      />
      <ApplicationContent reduced={true}>
        <Container>
          <Banner variant='warning'>The request has been deleted</Banner>
        </Container>
      </ApplicationContent>
    </ApplicationPage>
  )
}

const Container = styled.div`
  display: block;
  margin: ${({ theme }) => theme.sizes.spaces.xl}px auto;
  text-align: center;
`

DenyRequestsPage.getInitialProps = async (
  params: GetInitialPropsParameters
) => {
  const result = await getRequestDeniedPageData(params)
  return result
}

export default DenyRequestsPage
