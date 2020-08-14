import React, { useState, useCallback } from 'react'
import { usePreferences } from '../../../lib/preferences'
import TopBarLayout from '../layouts/TopBarLayout'
import TopBarButton from '../atoms/TopBarButton'
import Icon from '../../../components/atoms/Icon'
import { mdiClose, mdiChevronLeft, mdiChevronRight } from '@mdi/js'
import styled from '../../../lib/styled'
import { capitalize } from '../../../lib/string'
import { backgroundColor } from '../../../lib/styled/styleFunctions'
import TableViewCell from '../atoms/TableViewCell'
import TableViewLabel from '../atoms/TableViewLabel'
import ExternalLinkTableViewCell from '../atoms/ExternalLinkTableViewCell'
import MobilePageContainer from '../atoms/MobilePageContainer'
import GeneralPreferencesTab from './GeneralPreferencesTab'
import EditorPreferencesTab from './EditorPreferencesTab'
import BillingTab from '../../../components/PreferencesModal/BillingTab'

const PreferencesModalContainer = styled.div`
  z-index: 7000;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  ${backgroundColor}
  display: flex;
  overflow: hidden;
`

const PreferencesModal = () => {
  const { closed, toggleClosed } = usePreferences()
  const [tab, setTab] = useState<null | 'general' | 'editor' | 'billing'>(null)

  const unselectTab = useCallback(() => {
    setTab(null)
  }, [])

  const selectGeneralTab = useCallback(() => {
    setTab('general')
  }, [])

  const selectEditorTab = useCallback(() => {
    setTab('editor')
  }, [])

  const selectBillingTab = useCallback(() => {
    setTab('billing')
  }, [])

  if (closed) {
    return null
  }
  if (tab != null) {
    return (
      <PreferencesModalContainer>
        <TopBarLayout
          titleLabel={`Preferences / ${capitalize(tab)}`}
          leftControl={
            <TopBarButton onClick={unselectTab}>
              <Icon path={mdiChevronLeft} />
            </TopBarButton>
          }
        >
          <MobilePageContainer>{getTab(tab)}</MobilePageContainer>
        </TopBarLayout>
      </PreferencesModalContainer>
    )
  }

  return (
    <PreferencesModalContainer>
      <TopBarLayout
        titleLabel='Preferences'
        leftControl={
          <TopBarButton onClick={toggleClosed}>
            <Icon path={mdiClose} />
          </TopBarButton>
        }
      >
        <TableViewCell iconPath={mdiChevronRight} onClick={selectGeneralTab}>
          General
        </TableViewCell>
        <TableViewCell iconPath={mdiChevronRight} onClick={selectEditorTab}>
          Editor
        </TableViewCell>
        <TableViewCell iconPath={mdiChevronRight} onClick={selectBillingTab}>
          Billing
        </TableViewCell>
        <TableViewLabel>External links</TableViewLabel>
        <ExternalLinkTableViewCell url='https://github.com/BoostIO/Boostnote.next'>
          Github Repository
        </ExternalLinkTableViewCell>
        <ExternalLinkTableViewCell url='https://issuehunt.io/r/BoostIo/Boostnote.next'>
          IssueHunt
        </ExternalLinkTableViewCell>
        <ExternalLinkTableViewCell url='https://join.slack.com/t/boostnote-group/shared_invite/zt-cun7pas3-WwkaezxHBB1lCbUHrwQLXw'>
          Slack
        </ExternalLinkTableViewCell>
        <ExternalLinkTableViewCell url='https://twitter.com/boostnoteapp'>
          Twitter
        </ExternalLinkTableViewCell>
        <ExternalLinkTableViewCell url='https://www.facebook.com/groups/boostnote/'>
          Facebook
        </ExternalLinkTableViewCell>
        <ExternalLinkTableViewCell url='https://www.reddit.com/r/Boostnote/'>
          Reddit
        </ExternalLinkTableViewCell>
        <ExternalLinkTableViewCell url='https://boosthub.io/'>
          Boost Note for Team
        </ExternalLinkTableViewCell>
      </TopBarLayout>
    </PreferencesModalContainer>
  )
}

function getTab(tab: 'general' | 'editor' | 'billing') {
  switch (tab) {
    case 'editor':
      return <EditorPreferencesTab />
    case 'billing':
      return <BillingTab />
    default:
    case 'general':
      return <GeneralPreferencesTab />
  }
}

export default PreferencesModal
