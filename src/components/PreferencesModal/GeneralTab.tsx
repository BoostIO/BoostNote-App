import React, { useCallback, ChangeEventHandler } from 'react'
import Icon from '../atoms/Icon'
import { mdiPlus, mdiLoading } from '@mdi/js'
import { Section, SectionHeader, SectionControl } from './styled'
import {
  usePreferences,
  GeneralThemeOptions,
  GeneralLanguageOptions,
  GeneralNoteSortingOptions
} from '../../lib/preferences'
import { useTranslation } from 'react-i18next'
import { SelectChangeEventHandler } from '../../lib/events'
import { useLogin, useUsers } from '../../lib/accounts'
import UserInfo from '../atoms/UserInfo'

const GeneralTab = () => {
  const { preferences, setPreferences } = usePreferences()
  const [users, { setUser, removeUser }] = useUsers()
  const [loginState, startLogin] = useLogin(
    ({ token, user }) => setUser({ token, ...user }),
    err => console.error(err) //TODO: toast errors
  )

  const selectTheme: SelectChangeEventHandler = useCallback(
    event => {
      setPreferences({
        'general.theme': event.target.value as GeneralThemeOptions
      })
    },
    [setPreferences]
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

  const setEnableAnalytics: ChangeEventHandler<HTMLInputElement> = useCallback(
    event => {
      setPreferences({
        'general.enableAnalytics': event.target.checked
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
          <button onClick={startLogin}>
            {loginState !== 'logging-in' ? (
              <>
                <Icon path={mdiPlus} />
                {t(
                  users.length === 0
                    ? 'preferences.addAccount'
                    : 'preferences.switchAccount'
                )}
              </>
            ) : (
              <>
                <Icon path={mdiLoading} />
                {t('preferences.loginWorking')}
              </>
            )}
          </button>
        </div>
      </Section>
      <Section>
        <SectionHeader>{t('preferences.interfaceLanguage')}</SectionHeader>
        <SectionControl>
          <select
            value={preferences['general.language']}
            onChange={selectLanguage}
          >
            <option value='en-US'>English (US)</option>
            <option value='ja'>日本語</option>
          </select>
        </SectionControl>
      </Section>
      <Section>
        <SectionHeader>{t('preferences.applicationTheme')}</SectionHeader>
        <SectionControl>
          <select value={preferences['general.theme']} onChange={selectTheme}>
            <option value='auto'>{t('preferences.auto')}</option>
            <option value='light'>{t('preferences.light')}</option>
            <option value='dark'>{t('preferences.dark')}</option>
            <option value='solarized-dark'>
              {t('preferences.solarizedDark')}
            </option>
          </select>
        </SectionControl>
      </Section>
      <Section>
        <SectionHeader>{t('preferences.noteSorting')}</SectionHeader>
        <SectionControl>
          <select
            value={preferences['general.noteSorting']}
            onChange={selectNoteSorting}
          >
            <option value='date-updated'>{t('preferences.dateUpdated')}</option>
            <option value='date-created'>{t('preferences.dateCreated')}</option>
            <option value='title'>{t('preferences.title')}</option>
          </select>
        </SectionControl>
      </Section>
      <Section>
        <SectionHeader>{t('preferences.analytics')}</SectionHeader>
        <SectionControl>
          <p>{t('preferences.analyticsDescription1')}</p>
          <p>{t('preferences.analyticsDescription2')}</p>
          <label>
            <input
              type='checkbox'
              checked={preferences['general.enableAnalytics']}
              onChange={setEnableAnalytics}
            />

            {t('preferences.analyticsLabel')}
          </label>
        </SectionControl>
      </Section>
    </div>
  )
}

export default GeneralTab
