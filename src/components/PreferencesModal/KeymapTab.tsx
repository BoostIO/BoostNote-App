import React, { useCallback, useMemo } from 'react'
import { Section, SectionHeader } from './styled'
import { usePreferences } from '../../lib/preferences'
import { getGenericShortcutString, KeymapItem } from '../../lib/keymap'
import { useTranslation } from 'react-i18next'
import KeymapItemSection from '../atoms/KeymapItemSection'
import styled from '../../shared/lib/styled'
import Button from '../../shared/components/atoms/Button'

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
          <Button variant='danger' onClick={() => resetKeymap()}>
            Restore
          </Button>
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

export default KeymapTab
