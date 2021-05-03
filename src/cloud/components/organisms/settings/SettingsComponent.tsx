import React, { useMemo, useEffect } from 'react'
import { useSettings } from '../../../lib/stores/settings'
import SettingSidenavItem from './SettingSidenavItem'
import {
  preventKeyboardEventPropagation,
  useUpDownNavigationListener,
  useCapturingGlobalKeyDownHandler,
  isSingleKeyEventOutsideOfInput,
} from '../../../lib/keyboard'
import { useTranslation } from 'react-i18next'
import { mdiDomain, mdiAccountCircleOutline } from '@mdi/js'
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
import SettingsLayout from '../../../../shared/components/organisms/Settings/molecles/SettingsLayout'
import SettingSidenavHeader from '../../../../shared/components/organisms/Settings/atoms/SettingSidenavHeader'
import SettingSidenav from '../../../../shared/components/organisms/Settings/atoms/SettingSidenav'
import SettingContent from '../../../../shared/components/organisms/Settings/atoms/SettingContent'

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
    <SettingsLayout
      sidebar={
        <SettingSidenav ref={menuRef}>
          <SettingSidenavHeader
            path={mdiAccountCircleOutline}
            text={'Account'}
            size={16}
          />
          <SettingSidenavItem
            label={t('settings.personalInfo')}
            active={settingsTab === 'personalInfo'}
            tab='personalInfo'
            id='settings-personalInfoTab-btn'
          />
          <SettingSidenavItem
            label={t('settings.preferences')}
            active={settingsTab === 'preferences'}
            tab='preferences'
            id='settings-personalInfoTab-btn'
          />
          <SettingSidenavHeader path={mdiDomain} text={'Space'} size={16} />
          {currentUserPermissions != null && (
            <>
              <SettingSidenavItem
                label={t('settings.teamInfo')}
                active={settingsTab === 'teamInfo'}
                tab='teamInfo'
                id='settings-teamInfoTab-btn'
              />
              <SettingSidenavItem
                label={t('settings.teamMembers')}
                active={settingsTab === 'teamMembers'}
                tab='teamMembers'
                id='settings-teamMembersTab-btn'
              />
              <SettingSidenavItem
                label={t('settings.integrations')}
                active={settingsTab === 'integrations'}
                tab='integrations'
                id='settings-integrationsTab-btn'
              />
              <SettingSidenavItem
                label='API'
                active={settingsTab === 'api'}
                tab='api'
                id='settings-apiTab-btn'
              />
            </>
          )}
          {team != null &&
            currentUserPermissions != null &&
            currentUserPermissions.role === 'admin' && (
              <>
                {subscription == null || subscription.status === 'trialing' ? (
                  <SettingSidenavItem
                    label={t('settings.teamUpgrade')}
                    active={settingsTab === 'teamUpgrade'}
                    tab='teamUpgrade'
                    id='settings-teamUpgradeTab-btn'
                  />
                ) : (
                  <SettingSidenavItem
                    label={t('settings.teamSubscription')}
                    active={settingsTab === 'teamSubscription'}
                    tab='teamSubscription'
                    id='settings-teamBillingTab-btn'
                  />
                )}
                <TeamSubLimit />
              </>
            )}
        </SettingSidenav>
      }
      content={<SettingContent ref={contentSideRef}>{content}</SettingContent>}
    ></SettingsLayout>
  )
}

export default SettingsComponent
