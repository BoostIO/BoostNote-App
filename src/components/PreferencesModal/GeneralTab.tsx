import React, { useCallback } from 'react'
import {
  Section,
  SectionHeader,
  SectionControl,
  SectionSelect,
  SectionPrimaryButton
} from './styled'
import {
  usePreferences,
  GeneralThemeOptions,
  GeneralLanguageOptions,
  GeneralNoteSortingOptions,
  GeneralTutorialsOptions
} from '../../lib/preferences'
import { useTranslation } from 'react-i18next'
import { SelectChangeEventHandler } from '../../lib/events'
import { useUsers } from '../../lib/accounts'
import UserInfo from './UserInfo'
import LoginButton from '../atoms/LoginButton'
import { useAnalytics, analyticsEvents } from '../../lib/analytics'
import { IconArrowRotate } from '../icons'

const GeneralTab = () => {
  const { preferences, setPreferences } = usePreferences()
  const [users, { removeUser }] = useUsers()
  const { report } = useAnalytics()

  const selectTheme: SelectChangeEventHandler = useCallback(
    event => {
      setPreferences({
        'general.theme': event.target.value as GeneralThemeOptions
      })
      report(analyticsEvents.colorTheme)
    },
    [setPreferences, report]
  )

  const selectLanguage: SelectChangeEventHandler = useCallback(
    event => {
      setPreferences({
        'general.language': event.target.value as GeneralLanguageOptions
      })
    },
    [setPreferences]
  )

  const selectNoteSorting: SelectChangeEventHandler = useCallback(
    event => {
      setPreferences({
        'general.noteSorting': event.target.value as GeneralNoteSortingOptions
      })
    },
    [setPreferences]
  )

  const selectTutorialsDisplay: SelectChangeEventHandler = useCallback(
    event => {
      setPreferences({
        'general.tutorials': event.target.value as GeneralTutorialsOptions
      })
    },
    [setPreferences]
  )

  const { t } = useTranslation()

  return (
    <div>
      <Section>
        <SectionHeader>{t('preferences.account')}</SectionHeader>
        <div>
          {users.map(user => (
            <UserInfo key={user.id} user={user} signout={removeUser} />
          ))}
          {users.length === 0 && (
            <LoginButton
              onErr={console.error /* TODO: Toast error */}
              ButtonComponent={SectionPrimaryButton}
            >
              {loginState =>
                loginState !== 'logging-in' ? (
                  <>{t('preferences.addAccount')}</>
                ) : (
                  <>
                    <IconArrowRotate />
                    {t('preferences.loginWorking')}
                  </>
                )
              }
            </LoginButton>
          )}
        </div>
      </Section>
      <Section>
        <SectionHeader>{t('preferences.interfaceLanguage')}</SectionHeader>
        <SectionControl>
          <SectionSelect
            value={preferences['general.language']}
            onChange={selectLanguage}
          >
            <option value='de'>🇩🇪Deutsch</option>
            <option value='en-US'>🇺🇸English (US)</option>
            <option value='es-ES'>🇪🇸Español (España)</option>
            <option value='ja'>🇯🇵日本語</option>
            <option value='ko'>🇰🇷한국어</option>
            <option value='pt-BR'>🇧🇷Português (BR)</option>
            <option value='uk-UA'>🇺🇦Українська</option>
            <option value='zh-CN'>🇨🇳中文 (CN)</option>
            <option value='zh-HK'>🇭🇰中文 (HK)</option>
            <option value='zh-TW'>🇹🇼中文 (TW)</option>
          </SectionSelect>
        </SectionControl>
      </Section>
      <Section>
        <SectionHeader>{t('preferences.applicationTheme')}</SectionHeader>
        <SectionControl>
          <SectionSelect
            value={preferences['general.theme']}
            onChange={selectTheme}
          >
            <option value='auto'>{t('preferences.auto')}</option>
            <option value='light'>{t('preferences.light')}</option>
            <option value='dark'>{t('preferences.dark')}</option>
            <option value='sepia'>{t('preferences.sepia')}</option>
            <option value='solarizedDark'>
              {t('preferences.solarizedDark')}
            </option>
          </SectionSelect>
        </SectionControl>
      </Section>
      <Section>
        <SectionHeader>{t('preferences.noteSorting')}</SectionHeader>
        <SectionControl>
          <SectionSelect
            value={preferences['general.noteSorting']}
            onChange={selectNoteSorting}
          >
            <option value='date-updated'>{t('preferences.dateUpdated')}</option>
            <option value='date-created'>{t('preferences.dateCreated')}</option>
            <option value='title'>{t('preferences.title')}</option>
          </SectionSelect>
        </SectionControl>
      </Section>
      <Section>
        <SectionHeader>{t('preferences.displayTutorialsLabel')}</SectionHeader>
        <SectionControl>
          <SectionSelect
            value={preferences['general.tutorials']}
            onChange={selectTutorialsDisplay}
          >
            <option value='display'>Display</option>
            <option value='hide'>Hide</option>
          </SectionSelect>
        </SectionControl>
      </Section>
    </div>
  )
}

export default GeneralTab
