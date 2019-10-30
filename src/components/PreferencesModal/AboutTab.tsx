import React from 'react'
import { Section, SectionHeader } from './styled'

const AboutTab = () => {
  return (
    <div>
      <Section>
        <SectionHeader>About</SectionHeader>
        <div>Logo</div>
        <div>Boost Note {process.env.VERSION}</div>
      </Section>
    </div>
  )
}

export default AboutTab
