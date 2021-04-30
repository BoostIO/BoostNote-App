import React, { useCallback, useMemo } from 'react'
import { Section, SectionHeader } from './styled'
import { usePreferences } from '../../lib/preferences'
import { getGenericShortcutString, KeymapItem } from '../../lib/keymap'
import { useTranslation } from 'react-i18next'
import KeymapItemSection from '../atoms/KeymapItemSection'
import styled from '../../lib/styled/styled'

const KeymapTab = () => {
  const {
    preferences,
    updateKeymap,
    removeKeymap,
    resetKeymap,
  } = usePreferences()
  const { t } = useTranslation()

  const keymap = useMemo(() => {
    const keymap = preferences['general.keymap']
    return [...keymap.entries()]
  }, [preferences])

  const getKeymapItemSectionKey = useCallback((keymapItem: KeymapItem) => {
    if (keymapItem.shortcutMainStroke == null) {
      return keymapItem.description
    } else {
      return getGenericShortcutString(keymapItem.shortcutMainStroke)
    }
  }, [])

  return (
    <Section>
      <KeymapHeaderSection>
        <SectionHeader>{t('preferences.keymap')}</SectionHeader>
        <SectionResetKeymap>
          <KeymapItemButton onClick={() => resetKeymap()}>
            Restore
          </KeymapItemButton>
        </SectionResetKeymap>
      </KeymapHeaderSection>
      <KeymapItemList>
        {keymap != null &&
          keymap.map((keymapEntry: [string, KeymapItem]) => {
            return (
              <KeymapItemSection
                key={getKeymapItemSectionKey(keymapEntry[1])}
                keymapKey={keymapEntry[0]}
                currentKeymapItem={keymapEntry[1].shortcutMainStroke}
                description={keymapEntry[1].description}
                updateKeymap={updateKeymap}
                removeKeymap={removeKeymap}
              />
            )
          })}
      </KeymapItemList>
    </Section>
  )
}

const KeymapItemList = styled.div`
  display: grid;
  grid-template-rows: auto;
  row-gap: 0.5em;
`

const KeymapHeaderSection = styled.div`
  display: grid;
  grid-template-columns: auto auto;
`

const SectionResetKeymap = styled.div`
  margin-left: auto;
  align-self: center;
`

export const KeymapItemButton = styled.button`
  min-width: 88px;
  max-width: 120px;
  height: 32px;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;

  background-color: ${({ theme }) => theme.primaryButtonBackgroundColor};
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: 4px;

  transition: color 200ms ease-in-out;
  color: ${({ theme }) => theme.primaryButtonLabelColor};

  text-align: center;
  padding: 5px;

  &:hover {
    border-color: ${({ theme }) => theme.borderColor};
    background: ${({ theme }) => theme.primaryButtonHoverBackgroundColor};
  }
`

export default KeymapTab
