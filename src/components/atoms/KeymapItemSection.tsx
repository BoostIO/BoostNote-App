import React, {
  KeyboardEventHandler,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react'
import styled from '../../lib/styled'
import {
  getGenericShortcutString,
  KeymapItemEditableProps,
} from '../../lib/keymap'
import { inputStyle } from '../../lib/styled/styleFunctions'
import cc from 'classcat'
import { useToast } from '../../lib/toast'
import { ButtonContainer } from '../PreferencesModal/KeymapTab'

const invalidShortcutInputs = [' ']
const rejectedShortcutInputs = [' ', 'control', 'alt', 'shift']

interface KeymapItemSectionProps {
  keymapKey: string
  currentKeymapItem?: KeymapItemEditableProps
  updateKeymap: (
    key: string,
    shortcutFirst: KeymapItemEditableProps,
    shortcutSecond?: KeymapItemEditableProps
  ) => Promise<void>
  removeKeymap: (key: string) => void
  description: string
}

const KeymapItemSection = ({
  keymapKey,
  currentKeymapItem,
  updateKeymap,
  removeKeymap,
  description,
}: KeymapItemSectionProps) => {
  const [inputError, setInputError] = useState<boolean>(false)
  const [shortcutInputValue, setShortcutInputValue] = useState<string>('')
  const [changingShortcut, setChangingShortcut] = useState<boolean>(false)
  const [
    currentShortcut,
    setCurrentShortcut,
  ] = useState<KeymapItemEditableProps | null>(
    currentKeymapItem != null ? currentKeymapItem : null
  )
  const [
    previousShortcut,
    setPreviousShortcut,
  ] = useState<KeymapItemEditableProps | null>(null)
  const shortcutInputRef = useRef<HTMLInputElement>(null)

  const { pushMessage } = useToast()

  const fetchInputShortcuts: KeyboardEventHandler<HTMLInputElement> = (
    event
  ) => {
    event.stopPropagation()
    event.preventDefault()
    if (invalidShortcutInputs.includes(event.key.toLowerCase())) {
      setInputError(true)
      return
    }

    setInputError(false)
    const shortcut: KeymapItemEditableProps = {
      key: event.key.toUpperCase(),
      keycode: event.keyCode,
      modifiers: {
        ctrl: event.ctrlKey,
        alt: event.altKey,
        shift: event.shiftKey,
      },
    }
    setCurrentShortcut(shortcut)
    setShortcutInputValue(getGenericShortcutString(shortcut))
  }

  const applyKeymap = useCallback(() => {
    if (currentShortcut == null) {
      return
    }
    if (rejectedShortcutInputs.includes(currentShortcut.key.toLowerCase())) {
      setInputError(true)
      if (shortcutInputRef.current != null) {
        shortcutInputRef.current.focus()
      }
      return
    }

    updateKeymap(keymapKey, currentShortcut, undefined)
      .then(() => {
        setChangingShortcut(false)
        setInputError(false)
      })
      .catch(() => {
        pushMessage({
          title: 'Keymap assignment failed',
          description: 'Cannot assign to already assigned shortcut',
        })
        setInputError(true)
      })
  }, [currentShortcut, keymapKey, updateKeymap, pushMessage])

  const toggleChangingShortcut = useCallback(() => {
    if (changingShortcut) {
      applyKeymap()
    } else {
      setChangingShortcut(true)
      setPreviousShortcut(currentShortcut)
      if (currentShortcut != null) {
        setShortcutInputValue(getGenericShortcutString(currentShortcut))
      }
    }
  }, [applyKeymap, currentShortcut, changingShortcut])

  const handleCancelKeymapChange = useCallback(() => {
    setCurrentShortcut(previousShortcut)
    setChangingShortcut(false)
    setShortcutInputValue('')
    setInputError(false)
  }, [previousShortcut])

  const handleRemoveKeymap = useCallback(() => {
    setCurrentShortcut(null)
    setPreviousShortcut(null)
    setShortcutInputValue('')
    removeKeymap(keymapKey)
  }, [keymapKey, removeKeymap])

  const shortcutString = useMemo(() => {
    return currentShortcut != null
      ? getGenericShortcutString(currentShortcut)
      : ''
  }, [currentShortcut])
  return (
    <KeymapItemSectionContainer>
      <div>{description}</div>
      <KeymapItemInputSection>
        {changingShortcut && (
          <StyledInput
            className={cc([inputError && 'error'])}
            placeholder={'Press key'}
            autoFocus={true}
            ref={shortcutInputRef}
            value={shortcutInputValue}
            onKeyDown={fetchInputShortcuts}
          />
        )}

        <InputKeymapChooser onClick={toggleChangingShortcut}>
          {currentShortcut == null
            ? 'Assign'
            : changingShortcut
            ? 'Apply'
            : shortcutString}
        </InputKeymapChooser>
        {changingShortcut && (
          <ButtonContainer onClick={handleCancelKeymapChange}>
            Cancel
          </ButtonContainer>
        )}

        {currentShortcut != null && !changingShortcut && (
          <ButtonContainer onClick={handleRemoveKeymap}>
            Un-assign
          </ButtonContainer>
        )}
      </KeymapItemInputSection>
    </KeymapItemSectionContainer>
  )
}

const StyledInput = styled.input`
  ${inputStyle};
  max-width: 120px;
  min-width: 110px;
  height: 1.3em;

  &.error {
    border: 1px solid red;
  }
`

const InputKeymapChooser = styled.button`
  min-width: 88px;
  max-width: 120px;
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

  text-align: center;
  padding: 5px;

  &:hover {
    background: #2a5c69;
  }
`

const KeymapItemSectionContainer = styled.div`
  display: grid;
  grid-template-columns: 45% minmax(55%, 400px);
`

const KeymapItemInputSection = styled.div`
  display: grid;
  grid-auto-flow: column;
  align-items: center;

  max-width: 380px;
  justify-items: left;

  margin-right: auto;

  column-gap: 1em;
`

export default KeymapItemSection
