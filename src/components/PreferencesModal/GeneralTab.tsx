import React from 'react'
import Icon from '../atoms/Icon'
import { mdiPlus } from '@mdi/js'
import { Section, SectionHeader, SectionControl } from './styled'

const GeneralTab = () => {
  return (
    <div>
      <Section>
        <SectionHeader>Accounts</SectionHeader>
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
          <select>
            <option>English</option>
            <option>Japanese</option>
          </select>
        </SectionControl>
      </Section>
      <Section>
        <SectionHeader>Application Theme</SectionHeader>
        <SectionControl>
          <select>
            <option>Light</option>
            <option>Dark</option>
            <option>Solarized Dark</option>
          </select>
        </SectionControl>
      </Section>
      <Section>
        <SectionHeader>Note Sorting</SectionHeader>
        <SectionControl>
          <select>
            <option>Date Updated</option>
            <option>Date Created</option>
            <option>Title</option>
          </select>
        </SectionControl>
      </Section>
    </div>
  )
}

export default GeneralTab
