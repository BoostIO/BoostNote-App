import React from 'react'
import { Section, SectionHeader, SectionControl } from './styled'

const EditorTab = () => {
  return (
    <div>
      <Section>
        <SectionHeader>Editor Theme</SectionHeader>
        <SectionControl>
          <select>
            <option>default</option>
          </select>
        </SectionControl>
      </Section>
      <Section>
        <SectionHeader>Editor Font Size</SectionHeader>
        <SectionControl>
          <input type='number' />
        </SectionControl>
      </Section>
      <Section>
        <SectionHeader>Editor Font Family</SectionHeader>
        <SectionControl>
          <input type='value' />
        </SectionControl>
      </Section>
      <Section>
        <SectionHeader>Editor Indent Size</SectionHeader>
        <SectionControl>
          <select>
            <option>2</option>
            <option>4</option>
            <option>8</option>
          </select>
        </SectionControl>
      </Section>
      <Section>
        <SectionHeader>Editor Indent Type</SectionHeader>
        <SectionControl>
          <select>
            <option>Tab</option>
            <option>Spaces</option>
          </select>
        </SectionControl>
      </Section>
      <Section>
        <SectionHeader>Editor Keymap</SectionHeader>
        <SectionControl>
          <select>
            <option>Tab</option>
            <option>Spaces</option>
          </select>
        </SectionControl>
      </Section>
    </div>
  )
}

export default EditorTab
