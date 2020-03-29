import React, { useState, useEffect, CSSProperties } from 'react'
import {
  Section,
  SectionHeader,
  SectionPrimaryButton,
  SectionInput,
  SectionTable,
  SectionSubtleText,
} from './styled'
import { usePreferences, KeybindingConfig } from '../../lib/preferences'
import { useTranslation } from 'react-i18next'
import keycoder from 'keycoder'

const KeybindingsTab = () => {
  const { preferences, setPreferences } = usePreferences() //where all keybindings are stored
  const { t } = useTranslation()
  const [keybindings, setKeybindings] = useState({}) //stores all keybindings locally
  const [recording, setRecording] = useState(false)
  const [errored, setErrored] = useState([] as string[])
  const [errorMessage, setErrorMessage] = useState('')

  let keybindingOptions: string[] = []

  for (let option in preferences){
    let test = option.split('.')
    if (test[0] == 'keybinding'){
      keybindingOptions.push(test[1])
    }
  }

  const tableStyle: CSSProperties = {
    width: '25vw',
  }

  //populate existing settings
  useEffect(() => {
    const newState = {}
    keybindingOptions.forEach((option) => {
      newState[option] = preferences['keybinding.' + option]
    })
    setKeybindings(newState)
  }, [preferences])

  //generates the list of options
  const generateOptions = (curr: string, index: number) => {
    return (
      <tr>
        <td>{t('preferences.' + curr)}</td>
        <td>
          <SectionInput
            label={curr}
            key={index}
            onKeyDown={(e: KeyboardEvent) => {
              handleKeyDown(e, curr)
            }}
            onKeyUp={(e: KeyboardEvent) => {
              handleKeyUp(e, curr)
            }}
            value={codeToReadable(keybindings[curr])}
            //@ts-ignore [Don't know what event type to use]
            onFocus={(e) => {
              setRecording(true)
              e.target.value = ''
              keybindings[curr] = []
            }}
            onBlur={() => {
              if (recording) {
                setRecording(false)
              }
            }}
            style={getStyle(curr)}
          />
        </td>
      </tr>
    )
  }

  const getStyle = (label: string) => {
    const errorStyle: CSSProperties = {
      backgroundColor: '#A5533D',
      width: '25vw',
    }

    const tableStyle: CSSProperties = {
      width: '25vw',
    }

    return errored.includes(label) ? errorStyle : tableStyle
  }

  //changes Char codes to readable chars (needs to be tested in other locales)
  const codeToReadable = (keyCodeArray: KeybindingConfig = []) => {
    return keyCodeArray
      .map((keyCode) => {
        const key = keycoder.fromKeyCode(keyCode)
        return key.names[0] || key.character.toUpperCase()
      })
      .join(' + ')
  }

  const handleKeyDown = (e: KeyboardEvent, label: string) => {
    if (recording) {
      if (!keybindings[label].includes(e.keyCode)) {
        const newState = keybindings
        newState[label].push(e.keyCode)
        setKeybindings(newState)
      }
    }
  }

  const handleKeyUp = (e: KeyboardEvent, label: string) => {
    if (keybindings[label][keybindings[label].length - 1] == e.keyCode) {
      setRecording(false)
    }
  }

  const handleSave = () => {
    const newPreferences = preferences
    const errors = []
    for (const option in keybindings) {
      if (getValidity(keybindings[option])) {
        newPreferences['keybinding.' + option] = keybindings[option]
      } else {
        errors.push(option)
      }
    }

    if (errors.length < 1) {
      setPreferences(newPreferences)
      setErrorMessage('')
      setErrored(errors)
    } else {
      setErrorMessage(
        t('preferences.keybindingSaveError')
      )
      setErrored(errors)
      setPreferences(preferences)
    }
  }

  const getValidity = (keyCombo: number[]) => {
    let validity = true
    const allowedModifiers = [16, 17, 18]
    const allowedSingleKeys = [18, 17]

    if (keyCombo.length > 1) {
      keyCombo.forEach((key, index) => {
        if (!allowedModifiers.includes(key) && index !== keyCombo.length - 1) {
          validity = false
        }
      })
    }

    if (keyCombo.length > 0) {
      if (allowedModifiers.includes(keyCombo[keyCombo.length - 1])) {
        validity = false
      }
    }

    if (keyCombo.length == 1) {
      validity = allowedSingleKeys.includes(keyCombo[0])
    }

    if (
      keyCombo.length == 2 &&
      keyCombo.includes(17) &&
      keyCombo.includes(18)
    ) {
      validity = true
    }

    return validity
  }

  return (
    <div>
      <Section>
        <SectionHeader>Key Binding Settings</SectionHeader>
        <SectionPrimaryButton onClick={handleSave}> Save </SectionPrimaryButton>
        <SectionSubtleText style={{ color: 'red' }}>
          {errorMessage}
        </SectionSubtleText>
        <SectionTable>
          <tbody style={tableStyle}>
            {keybindingOptions.map((curr, index) =>
              generateOptions(curr, index)
            )}
          </tbody>
        </SectionTable>
      </Section>
    </div>
  )
}

export default KeybindingsTab
