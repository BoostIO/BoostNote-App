import React, { useCallback } from 'react'
import {
  Section,
  SectionHeader,
  SectionControl,
  SectionSelect,
  SectionPrimaryButton,
  SectionInput,
  SectionTable
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
import { useUsers } from '../../lib/accounts'
import { useAnalytics, analyticsEvents } from '../../lib/analytics'

const GeneralTab = () => {
  const { preferences, setPreferences } = usePreferences()
  const { report } = useAnalytics()
  const { t } = useTranslation()

  const selectTheme: SelectChangeEventHandler = useCallback(
    (event) => {
      setPreferences({
        'general.theme': event.target.value as GeneralThemeOptions,
      })
      report(analyticsEvents.colorTheme)
    },
    [setPreferences, report]
  )
  
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
          <SectionInput label={curr} key={index}/>
        </td>
      </tr>
    )
  } 

  return (
    <div>
      <Section>
        <SectionHeader>Key Binding Settings</SectionHeader>
         
        <SectionTable>
          
            { //@ts-ignore
              keybindingOptions.map((curr, index) => generateOptions(curr, index))
            }

        </SectionTable>
        
      </Section>
    </div>
  )
}

export default GeneralTab
