import React from 'react'
import { boostHubAccountDeletePageUrl } from '../../lib/boosthub'
import PageDraggableHeader from '../atoms/PageDraggableHeader'
import { mdiAccountGroup } from '@mdi/js'
import styled from '../../lib/styled'
import BoostHubWebview from '../atoms/BoostHubWebview'

const BoostHubAccountDeletePage = () => {
  return (
    <PageContainer>
      <PageDraggableHeader
        iconPath={mdiAccountGroup}
        label='Delete Boost Hub Account'
      />
      <WebViewContainer>
        <BoostHubWebview src={boostHubAccountDeletePageUrl} />
      </WebViewContainer>
    </PageContainer>
  )
}

export default BoostHubAccountDeletePage

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
