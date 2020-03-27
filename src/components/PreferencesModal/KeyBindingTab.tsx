import React, { useCallback, useState} from 'react'
import {
  Section,
  SectionHeader,
  SectionControl,
  SectionSelect,
  SectionPrimaryButton,
  SectionInput,
  SectionTable,
  SectionSubtleText
} from './styled'
import {
  usePreferences,
  GeneralThemeOptions,
  GeneralLanguageOptions,
  GeneralNoteSortingOptions,
  GeneralTutorialsOptions,
} from '../../lib/preferences'
import { useTranslation } from 'react-i18next'
import { SelectChangeEventHandler } from '../../lib/events'

const KeybindingsTab = () => {
  const { preferences, setPreferences } = usePreferences()
  const { t } = useTranslation()
  const [selected, setSelected] = useState("")
  const [keyCode, setKeyCode] = useState(0)
  
  
  const selectKeybinding: SelectChangeEventHandler = useCallback(
    (event) => {
      setPreferences({
        'general.theme': event.target.value as GeneralThemeOptions,
      })
    },
    [setPreferences]
  )
  
  const keybindingOptions = [
    "toggleBoostnote",
    "toggleMenu",
    "toggleEditMode",
    "toggleDirection",
    "deleteNote",
    "pasteHTML",
    "prettifyMarkdown",
    "insertCurrentDate",
    "insertCurrentDateTime"
  ]

  //type generateOptionType = (option: string, index: number) => Element
  const generateOptions = (curr: string, index: number) => {
    return(
      <tr>
        <td>
          {t("preferences." + curr)}
        </td>
        <td>
          <SectionInput label={curr} key={index} onKeyDown={handleTextChange}/>
        </td>
      </tr>
    )
  }

  const handleTextChange = (e: KeyboardEvent) => {
    setKeyCode(e.keyCode)
  }

  return (
    <div>
      <Section>
        <SectionHeader>Key Binding Settings</SectionHeader>
        <SectionSubtleText>Button last pressed: {keyCode} {selected} </SectionSubtleText>
         
        <SectionTable>
          
            { //@ts-ignore
              keybindingOptions.map((curr, index) => generateOptions(curr, index))
            }

        </SectionTable>
        
      </Section>
    </div>
  )
}

export default KeybindingsTab
