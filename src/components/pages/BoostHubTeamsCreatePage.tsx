import React from 'react'
import { boostHubTeamsCreatePageUrl } from '../../lib/boosthub'
import PageDraggableHeader from '../atoms/PageDraggableHeader'
import { mdiAccountGroup } from '@mdi/js'
import styled from '../../lib/styled'
import BoostHubWebview from '../atoms/BoostHubWebview'

const BoostHubTeamsCreatePage = () => {
  return (
    <PageContainer>
      <PageDraggableHeader
        iconPath={mdiAccountGroup}
        label='Create a cloud workspace'
      />
      <WebViewContainer>
        <BoostHubWebview src={boostHubTeamsCreatePageUrl} />
      </WebViewContainer>
    </PageContainer>
  )
}

export default BoostHubTeamsCreatePage

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`

const WebViewContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`
