import React from 'react'
import { useTitle } from 'react-use'
import Application from '../../../components/Application'
import { GetInitialPropsParameters } from '../../../interfaces/pages'
import InviteCTAButton from '../../../components/Buttons/InviteCTAButton'
import {
  getRequestDeniedPageData,
  RequestDeniedResponseBody,
} from '../../../api/pages/teams/requests'
import styled from '../../../../design/lib/styled'
import Banner from '../../../../design/components/atoms/Banner'

const DenyRequestsPage = ({}: RequestDeniedResponseBody) => {
  useTitle('Deny Edit Request')

  return (
    <Application
      content={{
        reduced: true,
        topbar: {
          breadcrumbs: [],
          controls: [
            {
              type: 'node',
              element: <InviteCTAButton key='invite-cta' />,
            },
          ],
        },
      }}
    >
      <Container>
        <Banner variant='warning'>The request has been deleted</Banner>
      </Container>
    </Application>
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
