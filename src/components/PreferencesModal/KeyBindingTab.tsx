import React, {useState, useEffect, SyntheticEvent} from 'react'
import {
  Section,
  SectionHeader,
  SectionPrimaryButton,
  SectionInput,
  SectionTable,
  SectionSubtleText
} from './styled'
import {
  usePreferences,
  KeybindingConfig,
} from '../../lib/preferences'
import { useTranslation } from 'react-i18next'
//@ts-ignore
const keycoder = require('keycoder')


const KeybindingsTab = () => {
  const { preferences, setPreferences } = usePreferences() //where all keybindings are stored
  const { t } = useTranslation()
  const [keyCode, setKeyCode] = useState(0) //DEBUGGING
  const [keybindings, setKeybindings] = useState({}) //stores all keybindings locally
  const [recording, setRecording] = useState(false)

  const keybindingOptions = [ //list of all the options available
    "toggleBoostNote",
    "toggleMenu",
    "toggleEditMode",
    "toggleDirection",
    "deleteNote",
    "pasteHTML",
    "prettifyMarkdown",
    "insertCurrentDate",
    "insertCurrentDateTime"
  ]

  //populate existing settings
  useEffect(() => {
    let newState = {}
    keybindingOptions.forEach((option) => {
      newState[option] = preferences['keybinding.' + option]
    })
    console.log(newState)
    setKeybindings(newState)
  }, [preferences])

  //generates the list of options
  const generateOptions = (curr: string, index: number) => {
    return(
      <tr>
        <td>
          {t("preferences." + curr)}
        </td>
        <td>
          <SectionInput 
          label={curr} 
          key={index} 
          onKeyDown={(e:KeyboardEvent) => {handleKeyDown(e, curr)}} 
          onKeyUp={(e:KeyboardEvent) => {handleKeyUp(e, curr)}}
          value={codeToReadable(keybindings[curr]) /*|| codeToReadable(preferences['keybinding.' + curr])*/}
          //@ts-ignore [Don't know what event type to use]
          onFocus={(e) => {setRecording(true); e.target.value = ""; keybindings[curr] = [];}}
          onBlur={() => {if(recording) {setRecording(false)}}}
          />
        </td>
      </tr>
    )
  }

  //changes Char codes to readable chars (needs to be tested in other locales)
  const codeToReadable = (keyCodeArray: KeybindingConfig = []) => {
    return keyCodeArray.map((keyCode) => {
      const key = keycoder.fromKeyCode(keyCode)
      return key.names[0] || key.character.toUpperCase()
    }).join(" + ")
  }

  const handleKeyDown = (e: KeyboardEvent, label: string) => {
    if(recording){
      setKeyCode(e.keyCode)
      if(!keybindings[label].includes(e.keyCode)){
        let newState = keybindings
        newState[label].push(e.keyCode)
        setKeybindings(newState)
      }
    }
  }

  const handleKeyUp = (e: KeyboardEvent, label: string) => {
    if(keybindings[label][keybindings[label].length-1] == e.keyCode){
      setRecording(false)
    }
  }

  const handleSave = () => {
    let newPreferences = preferences
    for(let option in keybindings){
      console.log(option, keybindings[option])
      newPreferences['keybinding.' + option] = keybindings[option]
    }
    setPreferences(newPreferences)
  }

  return (
    <div>
      <Section>
        <SectionHeader>Key Binding Settings</SectionHeader>
        <SectionSubtleText>Button last pressed: {keyCode} {recording.toString()} </SectionSubtleText> {/*Debugging*/}
        <SectionPrimaryButton onClick={handleSave}> Save </SectionPrimaryButton>
        <SectionTable>
          <tbody>
            { //@ts-ignore
              keybindingOptions.map((curr, index) => generateOptions(curr, index))
            }
          </tbody>
        </SectionTable>
      </Section>
    </div>
  )
}

export default KeybindingsTab
