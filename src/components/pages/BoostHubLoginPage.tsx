import React from 'react'
import BoostHubSignInForm from '../organisms/BoostHubSignInForm'
import { flexCenter } from '../../lib/styled/styleFunctions'
import styled from '../../shared/lib/styled'

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
