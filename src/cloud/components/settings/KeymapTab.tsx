import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { getGenericShortcutString, KeymapItem } from '../../../lib/keymap'
import Button from '../../../design/components/atoms/Button'
import KeymapItemSection from '../molecules/KeymapItemSection'
import styled from '../../../design/lib/styled'
import { usePreferences } from '../../lib/stores/preferences'
import Form from '../../../design/components/molecules/Form'
import { lngKeys } from '../../lib/i18n/types'
import FormRow from '../../../design/components/molecules/Form/templates/FormRow'
import SettingTabContent from '../../../design/components/organisms/Settings/atoms/SettingTabContent'

const KeymapTab = () => {
  const {
    preferences,
    updateKeymap,
    removeKeymap,
    resetKeymap,
  } = usePreferences()
  const { t } = useTranslation()

  const keymap = useMemo(() => {
    const keymap = preferences['keymap']
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
    <SettingTabContent
      title={t(lngKeys.SettingsKeymap)}
      body={
        <Form
          fullWidth={true}
          rows={[
            {
              items: [
                {
                  type: 'node',
                  element: (
                    <KeymapItemList>
                      {keymap != null &&
                        keymap.map((keymapEntry: [string, KeymapItem]) => {
                          return (
                            <KeymapItemSection
                              key={getKeymapItemSectionKey(keymapEntry[1])}
                              keymapKey={keymapEntry[0]}
                              currentKeymapItem={
                                keymapEntry[1].shortcutMainStroke
                              }
                              description={keymapEntry[1].description}
                              updateKeymap={updateKeymap}
                              removeKeymap={removeKeymap}
                              desktopOnly={
                                keymapEntry[1].desktopOnly == null
                                  ? false
                                  : keymapEntry[1].desktopOnly
                              }
                            />
                          )
                        })}
                    </KeymapItemList>
                  ),
                },
              ],
            },
          ]}
        >
          <FormRow>
            <KeymapHeaderSection>
              <SectionResetKeymap>
                <Button variant='danger' onClick={() => resetKeymap()}>
                  Restore
                </Button>
              </SectionResetKeymap>
            </KeymapHeaderSection>
          </FormRow>
        </Form>
      }
    />
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
