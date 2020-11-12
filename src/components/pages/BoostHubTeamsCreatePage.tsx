import React from 'react'
import { usePreferences } from '../../lib/preferences'
import { boostHubTeamsCreatePageUrl } from '../../lib/boosthub'
import BoostHubSignInForm from '../organisms/BoostHubSignInForm'
import PageDraggableHeader from '../atoms/PageDraggableHeader'
import { mdiAccountGroup } from '@mdi/js'
import PageScrollableContent from '../atoms/PageScrollableContent'
import styled from '../../lib/styled'
import BoostHubWebview from '../atoms/BoostHubWebview'

const BoostHubTeamsCreatePage = () => {
  const { preferences } = usePreferences()
  const boostHubUserInfo = preferences['boosthub.user']

  return (
    <PageContainer>
      <PageDraggableHeader
        iconPath={mdiAccountGroup}
        label='Create Boost Hub Team'
      />
      {boostHubUserInfo == null ? (
        <PageScrollableContent>
          <BoostHubSignInForm />
        </PageScrollableContent>
      ) : (
        <WebViewContainer>
          <BoostHubWebview src={boostHubTeamsCreatePageUrl} />
        </WebViewContainer>
      )}
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
