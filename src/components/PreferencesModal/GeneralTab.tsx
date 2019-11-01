import React, { ChangeEventHandler } from 'react'
import Icon from '../atoms/Icon'
import { mdiPlus } from '@mdi/js'
import { Section, SectionHeader, SectionControl } from './styled'
import {
  usePreferences,
  GeneralThemeOptions,
  GeneralLanguageOptions,
  GeneralNoteSortingOptions
} from '../../lib/preferences'

type SelectChangeEventHandler = ChangeEventHandler<HTMLSelectElement>

const GeneralTab = () => {
  const { preferences, setPreferences } = usePreferences()

  const selectTheme: SelectChangeEventHandler = event => {
    setPreferences({
      'general.theme': event.target.value as GeneralThemeOptions
    })
  }

  const selectLanguage: SelectChangeEventHandler = event => {
    setPreferences({
      'general.language': event.target.value as GeneralLanguageOptions
    })
  }

  const selectNoteSorting: SelectChangeEventHandler = event => {
    setPreferences({
      'general.noteSorting': event.target.value as GeneralNoteSortingOptions
    })
  }

  const setEnableAnalytics: ChangeEventHandler<HTMLInputElement> = event => {
    setPreferences({
      'general.enableAnalytics': event.target.checked
    })
  }

  return (
    <div>
      <Section>
        <SectionHeader>Account</SectionHeader>
        <div>
          <ul>
            <li>Account list</li>
          </ul>
          <button>
            <Icon path={mdiPlus} />
            Add Another Account
          </button>
        </div>
      </Section>
      <Section>
        <SectionHeader>Interface Language</SectionHeader>
        <SectionControl>
          <select
            value={preferences['general.language']}
            onChange={selectLanguage}
          >
            <option value='en-US'>English (US)</option>
            <option value='ja'>Japanese</option>
          </select>
        </SectionControl>
      </Section>
      <Section>
        <SectionHeader>Application Theme</SectionHeader>
        <SectionControl>
          <select value={preferences['general.theme']} onChange={selectTheme}>
            <option value='auto'>Auto</option>
            <option value='light'>Light</option>
            <option value='dark'>Dark</option>
            <option value='solarized-dark'>Solarized Dark</option>
          </select>
        </SectionControl>
      </Section>
      <Section>
        <SectionHeader>Note Sorting</SectionHeader>
        <SectionControl>
          <select
            value={preferences['general.noteSorting']}
            onChange={selectNoteSorting}
          >
            <option value='date-updated'>Date Updated</option>
            <option value='date-created'>Date Created</option>
            <option value='title'>Title</option>
          </select>
        </SectionControl>
      </Section>
      <Section>
        <SectionHeader>Analytics</SectionHeader>
        <SectionControl>
          <p>
            Boost Note collects anonymous data for the sole purpose of improving
            the application, and strictly does not collect any personal
            information such the contents of your notes. You can see how it
            works on GitHub.
          </p>
          <p>You can choose to enable or disable this option.</p>
          <label>
            <input
              type='checkbox'
              checked={preferences['general.enableAnalytics']}
              onChange={setEnableAnalytics}
            />
            Enable analytics to help improve Boostnote
          </label>
        </SectionControl>
      </Section>
    </div>
  )
}

export default GeneralTab
