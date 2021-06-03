import React from 'react'
import BoostHubSignInForm from '../organisms/BoostHubSignInForm'
import styled from '../../shared/lib/styled'
import { flexCenter } from '../../shared/lib/styled/styleFunctions'

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
