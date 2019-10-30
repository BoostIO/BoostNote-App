import React from 'react'
import { Section, SectionHeader, SectionControl } from './styled'

const MarkdownTab = () => {
  return (
    <div>
      <Section>
        <SectionHeader>Preview Style</SectionHeader>
        <SectionControl>
          <select>
            <option>default</option>
          </select>
          <div>Content...</div>
        </SectionControl>
      </Section>
      <Section>
        <SectionHeader>Code Block Theme</SectionHeader>
        <SectionControl>
          <select>
            <option>default</option>
          </select>
        </SectionControl>
      </Section>
    </div>
  )
}

export default MarkdownTab
