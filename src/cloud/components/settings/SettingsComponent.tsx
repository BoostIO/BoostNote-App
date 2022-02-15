import React, { useMemo, useEffect, useRef } from 'react'
import { useSettings } from '../../lib/stores/settings'
import {
  preventKeyboardEventPropagation,
  useUpDownNavigationListener,
  useCapturingGlobalKeyDownHandler,
  isSingleKeyEventOutsideOfInput,
} from '../../lib/keyboard'
import { useTranslation } from 'react-i18next'
import {
  mdiDomain,
  mdiAccountCircleOutline,
  mdiClose,
  mdiHelpCircleOutline,
} from '@mdi/js'
import { usePage } from '../../lib/stores/pageStore'
import { focusFirstChildFromElement } from '../../lib/dom'
import {
  isFocusRightSideShortcut,
  isFocusLeftSideShortcut,
} from '../../lib/shortcuts'
import { PageStoreWithTeam } from '../../interfaces/pageStore'
import Settings from '../../../design/components/organisms/Settings'
import SettingSidenavHeader from '../../../design/components/organisms/Settings/molecules/SettingSidenavHeader'
import SettingNavButtonItem, {
  SettingNavLinkItem,
  SettingsNavSubMenu,
} from '../../../design/components/organisms/Settings/atoms/SettingNavItem'
import Button from '../../../design/components/atoms/Button'
import SettingSidenav from '../../../design/components/organisms/Settings/molecules/SettingSidenav'
import AppFeedbackForm from '../AppFeedbackForm'
import SettingTabContent from '../../../design/components/organisms/Settings/atoms/SettingTabContent'
import { lngKeys } from '../../lib/i18n/types'
import PersonalInfoTab from './PersonalInfoTab'
import PreferencesTab from './PreferencesTab'
import TeamInfoTab from './TeamInfoTab'
import MembersTab from './MembersTab'
import UpgradeTab from './UpgradeTab'
import SubscriptionTab from './SubscriptionTab'
import IntegrationsTab from './IntegrationsTab'
import GithubIntegration from './GithubIntegration'
import SlackIntegration from './SlackIntegration'
import ApiTab from './ApiTab'
import AttachmentsTab from './AttachmentsTab'
import ImportTab from './ImportTab'
import TeamSubLimit from './TeamSubLimit'
import { ExternalLink } from '../../../design/components/atoms/Link'

const SettingsComponent = () => {
  const { t } = useTranslation()
  const {
    closed,
    toggleClosed,
    settingsTab,
    openSettingsTab,
    settingsOpeningOptions,
  } = useSettings()
  const contentSideRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const { team, subscription, currentUserPermissions } =
    usePage<PageStoreWithTeam>()

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
      case 'integrations.github':
        return <GithubIntegration />
      case 'integrations.slack':
        return <SlackIntegration />
      case 'api':
        return <ApiTab />
      case 'feedback':
        return (
          <SettingTabContent
            title={t(lngKeys.CommunityFeedback)}
            description={
              <>
                <p>{t(lngKeys.CommunityFeedbackSubtitle)}</p>
              </>
            }
            body={<AppFeedbackForm />}
            footer={
              <>
                <p>
                  You can also request features, report bugs, and ask questions
                  from{' '}
                  <ExternalLink href='https://github.com/BoostIO/BoostNote-App'>
                    our GitHub repository
                  </ExternalLink>
                  .
                </p>

                <ul>
                  <li>
                    <ExternalLink href='https://github.com/BoostIO/BoostNote-App/discussions/categories/feature-requests'>
                      Feature Requests
                    </ExternalLink>
                  </li>
                  <li>
                    <ExternalLink href='https://github.com/BoostIO/BoostNote-App/issues'>
                      Bug Reports
                    </ExternalLink>
                  </li>
                  <li>
                    <ExternalLink href='https://github.com/BoostIO/BoostNote-App/discussions/categories/q-a'>
                      Q&amp;A
                    </ExternalLink>
                  </li>
                </ul>
              </>
            }
          />
        )
      case 'attachments':
        return <AttachmentsTab />
      case 'import':
        return <ImportTab />
      default:
        return
    }
  }, [settingsTab, currentUserPermissions, settingsOpeningOptions, t])

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
            text={t(lngKeys.SettingsAccount)}
            size={16}
          />
          <SettingNavButtonItem
            label={t(lngKeys.SettingsPersonalInfo)}
            active={settingsTab === 'personalInfo'}
            id='settings-personalInfoTab-btn'
            onClick={() => openSettingsTab('personalInfo')}
          />
          <SettingNavButtonItem
            label={t(lngKeys.SettingsPreferences)}
            active={settingsTab === 'preferences'}
            id='settings-preferences-btn'
            onClick={() => openSettingsTab('preferences')}
          />
          <SettingSidenavHeader
            path={mdiDomain}
            text={t(lngKeys.SettingsSpace)}
            size={16}
          />
          {currentUserPermissions != null && (
            <>
              <SettingNavButtonItem
                label={t(lngKeys.SettingsTeamInfo)}
                active={settingsTab === 'teamInfo'}
                id='settings-teamInfoTab-btn'
                onClick={() => openSettingsTab('teamInfo')}
              />
              <SettingNavButtonItem
                label={t(lngKeys.GeneralMembers)}
                active={settingsTab === 'teamMembers'}
                id='settings-teamMembersTab-btn'
                onClick={() => openSettingsTab('teamMembers')}
              />
              <SettingsNavSubMenu label={t(lngKeys.SettingsIntegrations)}>
                <SettingNavButtonItem
                  label={'Zapier'}
                  active={settingsTab === 'integrations'}
                  id='settings-integrationsTab-btn'
                  onClick={() => openSettingsTab('integrations')}
                />
                <SettingNavButtonItem
                  label={'Github'}
                  active={settingsTab === 'integrations.github'}
                  id='settings-integrationsTab-btn'
                  onClick={() => openSettingsTab('integrations.github')}
                />
                <SettingNavButtonItem
                  label={'Slack'}
                  active={settingsTab === 'integrations.slack'}
                  id='settings-integrationsTab-btn'
                  onClick={() => openSettingsTab('integrations.slack')}
                />
              </SettingsNavSubMenu>
              <SettingNavButtonItem
                label='API'
                active={settingsTab === 'api'}
                id='settings-apiTab-btn'
                onClick={() => openSettingsTab('api')}
              />
              <SettingNavButtonItem
                label={t(lngKeys.GeneralImport)}
                active={settingsTab === 'import'}
                id='settings-importTab-btn'
                onClick={() => openSettingsTab('import')}
              />
              <SettingNavButtonItem
                label={t(lngKeys.GeneralAttachments)}
                active={settingsTab === 'attachments'}
                id='settings-attachmentsTab-btn'
                onClick={() => openSettingsTab('attachments')}
              />
            </>
          )}
          {team != null &&
            currentUserPermissions != null &&
            currentUserPermissions.role === 'admin' && (
              <>
                {subscription == null || subscription.status === 'trialing' ? (
                  <SettingNavButtonItem
                    label={t(lngKeys.SettingsTeamUpgrade)}
                    active={settingsTab === 'teamUpgrade'}
                    id='settings-teamUpgradeTab-btn'
                    onClick={() => openSettingsTab('teamUpgrade')}
                  />
                ) : (
                  <SettingNavButtonItem
                    label={t(lngKeys.SettingsTeamSubscription)}
                    active={settingsTab === 'teamSubscription'}
                    id='settings-teamBillingTab-btn'
                    onClick={() => openSettingsTab('teamSubscription')}
                  />
                )}
              </>
            )}

          <SettingSidenavHeader
            path={mdiHelpCircleOutline}
            text={t(lngKeys.GeneralHelp)}
            size={16}
          />
          <SettingNavLinkItem
            label={t(lngKeys.SettingsReleaseNotes)}
            href='https://github.com/BoostIO/BoostNote-App/discussions/categories/releases'
            id='release-note-link'
          />

          <SettingNavLinkItem
            label={t(lngKeys.SupportGuide)}
            href='https://intercom.help/boostnote-for-teams/en/'
            id='setting-support-link'
          />

          <SettingNavButtonItem
            label={t(lngKeys.CommunityFeedback)}
            active={settingsTab === 'feedback'}
            id='settings-feedback-btn'
            onClick={() => openSettingsTab('feedback')}
          />
          <SettingNavLinkItem
            label={t(lngKeys.KeyboardShortcuts)}
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
