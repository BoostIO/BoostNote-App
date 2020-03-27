import React, {useState, useEffect} from 'react'
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

const KeybindingsTab = () => {
  const { preferences, setPreferences } = usePreferences() //where all keybindings are stored
  const { t } = useTranslation()
  const [selected, setSelected] = useState("") //DEBUGGING
  const [keyCode, setKeyCode] = useState(0) //DEBUGGING
  const numArray: number[] = [] //used to init buffer
  const [buffer, setBuffer] = useState(numArray) //Buffer for current selection
  const [keybindings, setKeybindings] = useState({}) //stores all keybindings locally
  const modifierKeys = [16, 17, 18] //SHIFT, CTRL, ALT: Modifier keys
  
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
    let newState = keybindings
    keybindingOptions.forEach((option) => {
      newState[option] = preferences['keybinding.' + option]
    })
    console.log(newState)
    setKeybindings(newState)
  }, [setKeybindings])

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
          value={codeToReadable(keybindings[curr]) || codeToReadable(preferences['keybinding.' + curr])}/>
        </td>
      </tr>
    )
  }

  //changes Char codes to readable chars (needs to be tested in other locales)
  const codeToReadable = (keyCodeArray: KeybindingConfig = []) => {
    return keyCodeArray.map((keyCode) => {
      switch(keyCode){
        case 16: return 'SHIFT'
        case 17: return 'CTRL'
        case 18: return 'ALT'
        default: return String.fromCharCode(keyCode).toUpperCase()
      }
    }).join(" + ")
  }

  const handleKeyDown = (e: KeyboardEvent, label: string) => {
    setSelected(label)
    setKeyCode(e.keyCode)
  }

  const handleKeyUp = (e: KeyboardEvent, label: string) => {
  
  }

  return (
    <div>
      <Section>
        <SectionHeader>Key Binding Settings</SectionHeader>
        <SectionSubtleText>Button last pressed: {keyCode} {selected} </SectionSubtleText> {/*Debugging*/}
        <SectionPrimaryButton> Save </SectionPrimaryButton>
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
