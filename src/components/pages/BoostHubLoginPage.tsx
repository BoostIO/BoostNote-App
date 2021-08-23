import React from 'react'
import BoostHubSignInForm from '../organisms/BoostHubSignInForm'
import styled from '../../design/lib/styled'
import { flexCenter } from '../../design/lib/styled/styleFunctions'

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
