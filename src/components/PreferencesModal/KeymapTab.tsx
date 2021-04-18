import React, { useCallback, useMemo } from 'react'
import { Section, SectionHeader } from './styled'
import { usePreferences } from '../../lib/preferences'
import {
  getGenericShortcutString,
  KeymapItem,
  KeymapItemEditableProps,
} from '../../lib/keymap'
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
    if (keymap != null) {
      return [...keymap.entries()]
    } else {
      return []
    }
  }, [preferences])

  const handleAssignNewKeymap = useCallback(
    (
      key: string,
      firstShortcut: KeymapItemEditableProps,
      secondShortcut?: KeymapItemEditableProps
    ) => {
      return updateKeymap(key, firstShortcut, secondShortcut)
    },
    [updateKeymap]
  )

  const handleRemoveKeymap = useCallback(
    (key: string) => {
      removeKeymap(key)
    },
    [removeKeymap]
  )

  const handleResetKeymap = useCallback(() => {
    resetKeymap()
  }, [resetKeymap])

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
          <ButtonContainer onClick={handleResetKeymap}>Reset</ButtonContainer>
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
                onAssignNewKeymap={handleAssignNewKeymap}
                removeKeymap={handleRemoveKeymap}
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

export const ButtonContainer = styled.button`
  width: 92px;
  height: 32px;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;

  background: #214953;
  border: 1px solid #214953;
  border-radius: 4px;

  transition: color 200ms ease-in-out;
  color: ${({ theme }) => theme.navButtonColor};
  &:hover {
    color: ${({ theme }) => theme.navButtonHoverColor};
  }

  &:active,
  &.active {
    color: ${({ theme }) => theme.navButtonActiveColor};
  }

  &.disabled,
  &:disabled {
    color: ${({ theme }) => theme.disabledUiTextColor};
    background: #12292e;
    border: 1px solid #214953;
    border-radius: 4px;
    width: 88px;
    height: 32px;
  }
`

export default KeymapTab
