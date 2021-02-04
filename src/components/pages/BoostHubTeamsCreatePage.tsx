import React, { useRef } from 'react'
import { boostHubTeamsCreatePageUrl } from '../../lib/boosthub'
import PageDraggableHeader from '../atoms/PageDraggableHeader'
import { mdiAccountGroup } from '@mdi/js'
import styled from '../../lib/styled'
import BoostHubWebview, { WebviewControl } from '../atoms/BoostHubWebview'

const BoostHubTeamsCreatePage = () => {
  const controlRef = useRef<WebviewControl>()

  return (
    <PageContainer>
      <PageDraggableHeader
        onDoubleClick={() => {
          controlRef.current!.openDevTools()
        }}
        iconPath={mdiAccountGroup}
        label='Create a cloud workspace'
      />
      <WebViewContainer>
        <BoostHubWebview
          controlRef={controlRef}
          src={boostHubTeamsCreatePageUrl}
        />
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
