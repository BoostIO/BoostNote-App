import React, {
  KeyboardEventHandler,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  getGenericShortcutString,
  KeymapItemEditableProps,
} from '../../lib/keymap'
import cc from 'classcat'
import styled from '../../shared/lib/styled'
import { inputStyle } from '../../shared/lib/styled/styleFunctions'
import { useToast } from '../../shared/lib/stores/toast'
import Button from '../../shared/components/atoms/Button'

const invalidShortcutInputs = [' ']
const rejectedShortcutInputs = [' ', 'control', 'alt', 'shift', 'meta']

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
        meta: event.metaKey,
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
    return currentShortcut != null && currentKeymapItem != null
      ? getGenericShortcutString(currentKeymapItem)
      : ''
  }, [currentKeymapItem, currentShortcut])
  return (
    <KeymapItemSectionContainer>
      <div>{description}</div>
      <KeymapItemInputSection>
        {currentShortcut != null && currentKeymapItem != null && (
          <ShortcutItemStyle>{shortcutString}</ShortcutItemStyle>
        )}
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
        <Button variant={'primary'} onClick={toggleChangingShortcut}>
          {currentShortcut == null
            ? 'Assign'
            : changingShortcut
            ? 'Apply'
            : 'Change'}
        </Button>
        {changingShortcut && (
          <Button onClick={handleCancelKeymapChange}>Cancel</Button>
        )}

        {currentShortcut != null && !changingShortcut && (
          <Button onClick={handleRemoveKeymap}>Un-assign</Button>
        )}
      </KeymapItemInputSection>
    </KeymapItemSectionContainer>
  )
}

const ShortcutItemStyle = styled.div`
  min-width: 88px;
  max-width: 120px;
  height: 32px;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;

  background-color: ${({ theme }) => theme.colors.background.tertiary};
  color: ${({ theme }) => theme.colors.text.primary};

  border: 1px solid ${({ theme }) => theme.colors.border.main};
  border-radius: 4px;
`

const StyledInput = styled.input`
  ${inputStyle};
  max-width: 120px;
  min-width: 110px;
  height: 1.3em;

  &.error {
    border: 1px solid red;
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
