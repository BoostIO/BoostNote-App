import React from 'react'
import PageDraggableHeader from '../atoms/PageDraggableHeader'
import BoostHubSignInForm from '../organisms/BoostHubSignInForm'
import PageScrollableContent from '../atoms/PageScrollableContent'
import styled from '../../lib/styled'

const BoostHubLoginPage = () => {
  return (
    <PageContainer>
      <PageDraggableHeader label='Sign up/in to Boost Hub' />
      <PageScrollableContent>
        <BoostHubSignInForm />
      </PageScrollableContent>
    </PageContainer>
  )
}

export default BoostHubLoginPage

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`
