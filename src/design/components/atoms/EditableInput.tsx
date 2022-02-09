import React, {
  useState,
  useRef,
  useCallback,
  ChangeEventHandler,
  useEffect,
  KeyboardEventHandler,
  useMemo,
} from 'react'
import Icon from './Icon'
import { mdiPencilOutline, mdiCheck } from '@mdi/js'
import styled from '../../lib/styled'
import { max } from 'ramda'
import FormInput from '../molecules/Form/atoms/FormInput'
import Button from './Button'
import { overflowEllipsis } from '../../lib/styled/styleFunctions'

interface EditableInputProps {
  editOnStart?: boolean
  placeholder?: string
  showConfirmation?: boolean
  text: string
  onTextChange: (newText: string) => void
  disabled?: boolean
  onKeydownConfirm?: () => void
  onBlur?: (() => void) | 'cancel' | 'submit'
  onCancel?: () => void
}

const EditableInput = ({
  editOnStart = false,
  showConfirmation = true,
  placeholder,
  disabled,
  text,
  onCancel,
  onTextChange,
  onKeydownConfirm,
  onBlur,
}: EditableInputProps) => {
  const titleInputRef = useRef<HTMLInputElement>(null)
  const textRef = useRef(text)

  const [editingText, setEditingText] = useState(editOnStart)
  const [newText, setNewText] = useState(() => {
    return text || ''
  })

  const startEditingText = useCallback(() => {
    if (text == null) {
      return
    }
    setEditingText(true)
    setNewText(text)
  }, [text])

  useEffect(() => {
    if (editingText && titleInputRef.current != null) {
      titleInputRef.current.focus()
    }
  }, [editingText])

  useEffect(() => {
    if (textRef.current === text) {
      return
    }

    textRef.current = text
    setEditingText(false)
  }, [text])

  const updateNewText: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      setNewText(event.target.value)
    },
    []
  )

  const finishEditingText = useCallback(() => {
    if (onTextChange == null) {
      return
    }
    onTextChange(newText)
    setEditingText(false)
  }, [onTextChange, newText])

  const cancelEditingText = useCallback(() => {
    if (onCancel != null) {
      onCancel()
    }
    setEditingText(false)
    setNewText(text)
  }, [text, onCancel])

  const onSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault()
      finishEditingText()
      if (onKeydownConfirm != null) {
        onKeydownConfirm()
      }
      return
    },
    [onKeydownConfirm, finishEditingText]
  )

  const handleTextInputKeyDown: KeyboardEventHandler<HTMLInputElement> =
    useCallback(
      (event) => {
        switch (event.key) {
          case 'Esc':
          case 'Escape':
            event.preventDefault()
            cancelEditingText()
            break
          case 'Enter':
            event.preventDefault()
            onSubmit(event)
          default:
            event.stopPropagation()
            break
        }
      },
      [cancelEditingText, onSubmit]
    )

  const maxWidth: string | number = useMemo(() => {
    // HTML5 canvas width to calculate
    if (titleInputRef.current != null && window != null) {
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      if (context != null) {
        context.font = window.getComputedStyle(titleInputRef.current).font
        const width = context.measureText(newText).width + 40
        return `${max(width, 60)}px`
      }
    }

    return `${max(newText.length, 8)}em`
  }, [newText])

  const handleBlur = useCallback(() => {
    if (onBlur == null) {
      return
    }

    if (onBlur === 'cancel') {
      cancelEditingText()
    } else if (onBlur === 'submit') {
      finishEditingText()
    } else {
      onBlur()
    }
  }, [onBlur, cancelEditingText, finishEditingText])

  return (
    <EditableInputContainer className='editable__input'>
      {editingText ? (
        <form onSubmit={onSubmit} style={{ maxWidth }}>
          <FormInput
            placeholder={placeholder}
            ref={titleInputRef}
            onChange={updateNewText}
            value={newText}
            onKeyDown={handleTextInputKeyDown}
            disabled={disabled}
            onBlur={handleBlur}
          />
          {showConfirmation && (
            <Button
              variant='icon'
              iconPath={mdiCheck}
              iconSize={16}
              type='submit'
              size='sm'
              disabled={disabled}
            />
          )}
        </form>
      ) : (
        <Button
          variant='transparent'
          className='editable__input__btn'
          onClick={startEditingText}
          size='sm'
          disabled={disabled}
        >
          <span className='editable__input__btn__label'>
            {text.trim().length === 0 ? 'Untitled' : text}
            <Icon
              className='editable__input__btn__icon'
              path={mdiPencilOutline}
              size={16}
            />
          </span>
        </Button>
      )}
    </EditableInputContainer>
  )
}

const EditableInputContainer = styled.div`
  display: flex;
  flex: 1;
  height: fit-content;
  overflow-x: hidden;

  form {
    display: flex;
    flex: 1 1 50px;
    flex-wrap: nowrap;
    align-items: center;
  }

  button[type='submit'] {
    flex: 0 1 auto;
  }

  .editable__input__btn {
    flex: 0 1 auto;
    min-width: 0;
    display: flex;
    align-items: center;
    .editable__input__btn__icon {
      margin-right: 4px;
      margin-left: 4px;
      color: ${({ theme }) => theme.colors.text.subtle};
      transition: opacity 0.3s ease-in-out;
    }
    &:hover {
      .editable__input__btn__icon {
        color: ${({ theme }) => theme.colors.text.primary};
      }
    }
    .editable__input__btn__label {
      color: ${({ theme }) => theme.colors.text.primary};
      padding: 2px;
      border-radius: 3px;
      ${overflowEllipsis};
      min-width: 0;
      display: flex;
      align-items: center;
    }
  }
`

export default EditableInput
