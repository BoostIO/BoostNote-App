import React from 'react'
import BoostHubSignInForm from '../organisms/BoostHubSignInForm'
import styled from '../../lib/styled'
import { flexCenter } from '../../lib/styled/styleFunctions'

const BoostHubLoginPage = () => {
  return (
    <PageContainer>
      <BoostHubSignInForm />
    </PageContainer>
  )
}

export default BoostHubLoginPage

const PageContainer = styled.div`
  width: 100%;
  height: 100%;
  ${flexCenter}
`
