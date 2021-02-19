import React, { useMemo, useEffect } from 'react'
import styled from '../../../lib/styled'
import { useSettings } from '../../../lib/stores/settings'
import TabButton from './TabButton'
import {
  preventKeyboardEventPropagation,
  useUpDownNavigationListener,
  useCapturingGlobalKeyDownHandler,
  isSingleKeyEventOutsideOfInput,
} from '../../../lib/keyboard'
import { baseIconStyle } from '../../../lib/styled/styleFunctions'
import { useTranslation } from 'react-i18next'
import Icon from '../../atoms/IconMdi'
import {
  mdiClose,
  mdiDomain,
  mdiAccountGroup,
  mdiProfessionalHexagon,
  mdiThemeLightDark,
  mdiFlash,
  mdiKey,
  mdiAccountCircleOutline,
} from '@mdi/js'
import {
  StyledModals,
  StyledModalsBackground,
  StyledModalsContainer,
  StyledSideNavModal,
} from '../Modal/styled'
import PersonalInfoTab from './PersonalInfoTab'
import { usePage } from '../../../lib/stores/pageStore'
import TeamInfoTab from './TeamInfoTab'
import MembersTab from './MembersTab'
import UpgradeTab from './UpgradeTab'
import SubscriptionTab from './SubscriptionTab'
import TeamSubLimit from './TeamSubLimit'
import { focusFirstChildFromElement } from '../../../lib/dom'
import {
  isFocusRightSideShortcut,
  isFocusLeftSideShortcut,
} from '../../../lib/shortcuts'
import IntegrationsTab from './IntegrationsTab'
import PreferencesTab from './PreferencesTab'
import ApiTab from './ApiTab'
import { PageStoreWithTeam } from '../../../interfaces/pageStore'

const SettingsComponent = () => {
  const { t } = useTranslation()
  const { closed, toggleClosed, settingsTab } = useSettings()
  const contentSideRef = React.createRef<HTMLDivElement>()
  const menuRef = React.createRef<HTMLDivElement>()
  const { team, subscription, currentUserPermissions } = usePage<
    PageStoreWithTeam
  >()

  const keydownHandler = useMemo(() => {
    return (event: KeyboardEvent) => {
      if (closed) {
        return
      }
      if (isSingleKeyEventOutsideOfInput(event, 'escape')) {
        preventKeyboardEventPropagation(event)
        toggleClosed()
        return
      }
      if (isFocusLeftSideShortcut(event)) {
        preventKeyboardEventPropagation(event)
        focusFirstChildFromElement(menuRef.current)
        return
      }

      if (isFocusRightSideShortcut(event)) {
        preventKeyboardEventPropagation(event)
        focusFirstChildFromElement(contentSideRef.current)
        return
      }
    }
  }, [closed, toggleClosed, menuRef, contentSideRef])
  useCapturingGlobalKeyDownHandler(keydownHandler)
  useUpDownNavigationListener(menuRef, { inactive: closed })

  const content = useMemo(() => {
    if (
      currentUserPermissions == null &&
      [
        'teamInfo',
        'teamMembers',
        'teamUpgrade',
        'teamSubscription',
        'integrations',
        'api',
      ].includes(settingsTab)
    ) {
      return null
    }

    switch (settingsTab) {
      case 'personalInfo':
        return <PersonalInfoTab />
      case 'preferences':
        return <PreferencesTab />
      case 'teamInfo':
        return <TeamInfoTab />
      case 'teamMembers':
        return <MembersTab />
      case 'teamUpgrade':
        return <UpgradeTab />
      case 'teamSubscription':
        return <SubscriptionTab />
      case 'integrations':
        return <IntegrationsTab />
      case 'api':
        return <ApiTab />
      default:
        return
    }
  }, [settingsTab, currentUserPermissions])

  const backgroundClickHandler = useMemo(() => {
    return (event: MouseEvent) => {
      event.preventDefault()
      toggleClosed()
    }
  }, [toggleClosed])

  useEffect(() => {
    if (closed) {
      return
    }
    focusFirstChildFromElement(contentSideRef.current)
  }, [closed, contentSideRef])

  if (closed) {
    return null
  }

  return (
    <StyledModals>
      <StyledModalsBackground onClick={backgroundClickHandler} />
      <StyledModalsContainer className='fullscreen'>
        <StyledSideNavModal>
          <TabNav ref={menuRef}>
            <Subtitle>Account</Subtitle>
            <TabButton
              label={t('settings.personalInfo')}
              active={settingsTab === 'personalInfo'}
              tab='personalInfo'
              id='settings-personalInfoTab-btn'
              prependIcon={mdiAccountCircleOutline}
            />
            <TabButton
              label={t('settings.preferences')}
              active={settingsTab === 'preferences'}
              tab='preferences'
              id='settings-personalInfoTab-btn'
              prependIcon={mdiThemeLightDark}
            />
            <Subtitle>Space</Subtitle>
            {currentUserPermissions != null && (
              <>
                <TabButton
                  label={t('settings.teamInfo')}
                  active={settingsTab === 'teamInfo'}
                  tab='teamInfo'
                  id='settings-teamInfoTab-btn'
                  prependIcon={mdiDomain}
                />
                <TabButton
                  label={t('settings.teamMembers')}
                  active={settingsTab === 'teamMembers'}
                  tab='teamMembers'
                  id='settings-teamMembersTab-btn'
                  prependIcon={mdiAccountGroup}
                />
                <TabButton
                  label={t('settings.integrations')}
                  active={settingsTab === 'integrations'}
                  tab='integrations'
                  id='settings-integrationsTab-btn'
                  prependIcon={mdiFlash}
                />
                <TabButton
                  label='API'
                  active={settingsTab === 'api'}
                  tab='api'
                  id='settings-apiTab-btn'
                  prependIcon={mdiKey}
                />
              </>
            )}
            {team != null &&
              currentUserPermissions != null &&
              currentUserPermissions.role === 'admin' && (
                <>
                  {subscription == null ||
                  subscription.status === 'trialing' ? (
                    <TabButton
                      label={t('settings.teamUpgrade')}
                      active={settingsTab === 'teamUpgrade'}
                      tab='teamUpgrade'
                      id='settings-teamUpgradeTab-btn'
                      prependIcon={mdiProfessionalHexagon}
                    />
                  ) : (
                    <TabButton
                      label={t('settings.teamSubscription')}
                      active={settingsTab === 'teamSubscription'}
                      tab='teamSubscription'
                      id='settings-teamBillingTab-btn'
                      prependIcon={mdiProfessionalHexagon}
                    />
                  )}
                  <TeamSubLimit />
                </>
              )}
          </TabNav>
        </StyledSideNavModal>
        <DividerBorder />
        <TabContent ref={contentSideRef}>{content}</TabContent>
        <CloseButton onClick={toggleClosed}>
          <Icon path={mdiClose} />
        </CloseButton>
      </StyledModalsContainer>
    </StyledModals>
  )
}

const TabNav = styled.nav`
  width: 250px;
  padding: 0;
  overflow: hidden auto;
  margin-right: 0;
  margin-bottom: 0;
  padding: ${({ theme }) => theme.space.xsmall}px 0;

  hr {
    height: 1px;
    background-color: ${({ theme }) => theme.baseBorderColor};
    border: none;
    margin: ${({ theme }) => theme.space.small}px 0;
  }
`

const Subtitle = styled.div`
  margin: ${({ theme }) => theme.space.default}px
    ${({ theme }) => theme.space.default}px
    ${({ theme }) => theme.space.xsmall}px;
  color: ${({ theme }) => theme.baseTextColor};
  font-size: ${({ theme }) => theme.fontSizes.large}px;
  text-transform: uppercase;
  font-weight: 500;
`

const TabContent = styled.div`
  flex: 1;
  overflow: hidden auto;
  position: relative;
`

const CloseButton = styled.button`
  ${baseIconStyle}
  position: absolute;
  top: ${({ theme }) => theme.space.small}px;
  right: ${({ theme }) => theme.space.small}px;
  width: 40px;
  height: 40px;
  background-color: transparent;
  border: none;
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.xxlarge}px;
`

const DividerBorder = styled.div`
  width: 1px;
  height: 100%;
  background-color: ${({ theme }) => theme.baseBorderColor};
`

export default SettingsComponent
