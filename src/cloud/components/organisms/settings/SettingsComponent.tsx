import React, { useMemo, useEffect } from 'react'
import { useSettings } from '../../../lib/stores/settings'
import {
  preventKeyboardEventPropagation,
  useUpDownNavigationListener,
  useCapturingGlobalKeyDownHandler,
  isSingleKeyEventOutsideOfInput,
} from '../../../lib/keyboard'
import { useTranslation } from 'react-i18next'
import {
  mdiDomain,
  mdiAccountCircleOutline,
  mdiClose,
  mdiHelpCircleOutline,
} from '@mdi/js'
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
import Settings from '../../../../shared/components/organisms/Settings'
import SettingSidenavHeader from '../../../../shared/components/organisms/Settings/molecules/SettingSidenavHeader'
import SettingNavButtonItem, {
  SettingNavLinkItem,
} from '../../../../shared/components/organisms/Settings/atoms/SettingNavItem'
import Button from '../../../../shared/components/atoms/Button'
import SettingSidenav from '../../../../shared/components/organisms/Settings/molecules/SettingSidenav'
import AppFeedbackForm from '../../molecules/AppFeedbackForm'
import SettingTabContent from '../../../../shared/components/organisms/Settings/atoms/SettingTabContent'
import { intercomAppId } from '../../../lib/consts'

const SettingsComponent = () => {
  const { t } = useTranslation()
  const {
    closed,
    toggleClosed,
    settingsTab,
    openSettingsTab,
    settingsOpeningOptions,
  } = useSettings()
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
        return <UpgradeTab {...settingsOpeningOptions} />
      case 'teamSubscription':
        return <SubscriptionTab />
      case 'integrations':
        return <IntegrationsTab />
      case 'api':
        return <ApiTab />
      case 'feedback':
        return (
          <SettingTabContent
            title='Feedback'
            description='Want a specific feature? Did you notice a bug? Let us know!'
            body={<AppFeedbackForm />}
          />
        )
      default:
        return
    }
  }, [settingsTab, currentUserPermissions, settingsOpeningOptions])

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
    <Settings
      sidebar={
        <SettingSidenav
          className='settings__sidenav'
          ref={menuRef}
          footer={
            team != null &&
            currentUserPermissions != null &&
            currentUserPermissions.role === 'admin' ? (
              <TeamSubLimit />
            ) : null
          }
        >
          <SettingSidenavHeader
            path={mdiAccountCircleOutline}
            text={'Account'}
            size={16}
          />
          <SettingNavButtonItem
            label={t('settings.personalInfo')}
            active={settingsTab === 'personalInfo'}
            id='settings-personalInfoTab-btn'
            onClick={() => openSettingsTab('personalInfo')}
          />
          <SettingNavButtonItem
            label={t('settings.preferences')}
            active={settingsTab === 'preferences'}
            id='settings-preferences-btn'
            onClick={() => openSettingsTab('preferences')}
          />
          <SettingSidenavHeader path={mdiDomain} text={'Space'} size={16} />
          {currentUserPermissions != null && (
            <>
              <SettingNavButtonItem
                label={t('settings.teamInfo')}
                active={settingsTab === 'teamInfo'}
                id='settings-teamInfoTab-btn'
                onClick={() => openSettingsTab('teamInfo')}
              />
              <SettingNavButtonItem
                label={t('settings.teamMembers')}
                active={settingsTab === 'teamMembers'}
                id='settings-teamMembersTab-btn'
                onClick={() => openSettingsTab('teamMembers')}
              />
              <SettingNavButtonItem
                label={t('settings.integrations')}
                active={settingsTab === 'integrations'}
                id='settings-integrationsTab-btn'
                onClick={() => openSettingsTab('integrations')}
              />
              <SettingNavButtonItem
                label='API'
                active={settingsTab === 'api'}
                id='settings-apiTab-btn'
                onClick={() => openSettingsTab('api')}
              />
            </>
          )}
          {team != null &&
            currentUserPermissions != null &&
            currentUserPermissions.role === 'admin' && (
              <>
                {subscription == null || subscription.status === 'trialing' ? (
                  <SettingNavButtonItem
                    label={t('settings.teamUpgrade')}
                    active={settingsTab === 'teamUpgrade'}
                    id='settings-teamUpgradeTab-btn'
                    onClick={() => openSettingsTab('teamUpgrade')}
                  />
                ) : (
                  <SettingNavButtonItem
                    label={t('settings.teamSubscription')}
                    active={settingsTab === 'teamSubscription'}
                    id='settings-teamBillingTab-btn'
                    onClick={() => openSettingsTab('teamSubscription')}
                  />
                )}
              </>
            )}

          <SettingSidenavHeader
            path={mdiHelpCircleOutline}
            text={'Help'}
            size={16}
          />
          <SettingNavLinkItem
            label='Support Guide'
            href='https://intercom.help/boostnote-for-teams/en/'
            id='setting-support-link'
          />

          {intercomAppId != null && (
            <SettingNavButtonItem
              label='Send us a message'
              id='settings-helper-btn'
              className='helper-message'
            />
          )}
          <SettingNavButtonItem
            label='Feedback'
            active={settingsTab === 'feedback'}
            id='settings-feedback-btn'
            onClick={() => openSettingsTab('feedback')}
          />
          <SettingNavLinkItem
            label='Keyboard Shortcuts'
            href='https://intercom.help/boostnote-for-teams/en/articles/4347206-keyboard-shortcuts'
            id='setting-keyboard-shortcuts'
          />
        </SettingSidenav>
      }
      content={
        <div className='settings__content__wrapper' ref={contentSideRef}>
          {content}
          <Button
            variant='icon'
            className='settings__close-btn'
            onClick={toggleClosed}
            iconPath={mdiClose}
            iconSize={26}
          />
        </div>
      }
    />
  )
}

export default SettingsComponent
