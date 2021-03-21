import React, {
  useState,
  useRef,
  useCallback,
  ChangeEventHandler,
  useEffect,
  KeyboardEventHandler,
  useMemo,
  MutableRefObject,
} from 'react'
import Icon from './Icon'
import { mdiPencilOutline, mdiCheck } from '@mdi/js'
import { inputStyle } from '../../lib/styled/styleFunctions'
import styled from '../../lib/styled'
import { max } from 'ramda'

interface EditableInputProps {
  focusTitleInputRef?: MutableRefObject<(() => void) | undefined>
  editOnStart?: boolean
  placeholder?: string
  text: string
  onTextChange: (newText: string) => void
  onKeydownConfirm?: () => void
}

type EditableInput = {
  folderLabel: string
  folderPathname: string
}[]

const EditableInput = ({
  focusTitleInputRef,
  editOnStart = false,
  placeholder,
  text,
  onTextChange,
  onKeydownConfirm,
}: EditableInputProps) => {
  const titleInputRef = useRef<HTMLInputElement>(null)
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
    if (focusTitleInputRef == null) {
      return
    }
    focusTitleInputRef.current = startEditingText
  }, [startEditingText, focusTitleInputRef])

  useEffect(() => {
    if (editingText && titleInputRef.current != null) {
      titleInputRef.current.focus()
    }
  }, [editingText])

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
    setEditingText(false)
    setNewText(text)
  }, [text])

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

  const handleTextInputKeyDown: KeyboardEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      switch (event.key) {
        case 'Esc':
        case 'Escape':
          event.preventDefault()
          cancelEditingText()
          break
      }
    },
    [cancelEditingText]
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

  return (
    <StyledEditableInput>
      {editingText ? (
        <form onSubmit={onSubmit} style={{ maxWidth }}>
          <StyledInput
            placeholder={placeholder}
            ref={titleInputRef}
            onChange={updateNewText}
            value={newText}
            onKeyDown={handleTextInputKeyDown}
          />
          <button type='submit'>
            <Icon path={mdiCheck} size={18} />
          </button>
        </form>
      ) : (
        <button className='input-btn' onClick={startEditingText}>
          <span className='truncated'>
            {text.trim().length === 0 ? 'Untitled' : text}
            <Icon className='hoverIcon' path={mdiPencilOutline} size={16} />
          </span>
        </button>
      )}
    </StyledEditableInput>
  )
}

const StyledInput = styled.input`
  ${inputStyle};
  flex: 1 2 30px;
  width: 30px;
`

const StyledEditableInput = styled.div`
  display: flex;
  flex: 1;
  height: 100%;
  overflow-x: hidden;
  color: ${({ theme }) => theme.baseTextColor};

  form {
    display: flex;
    flex: 1 1 50px;
    flex-wrap: nowrap;
    align-items: center;
    padding-left: ${({ theme }) => theme.space.xxsmall}px;
  }

  button[type='submit'] {
    background-color: transparent;
    color: ${({ theme }) => theme.baseTextColor};
    cursor: pointer;
    text-decoration: none !important;
    flex: 0 1 auto;
  }

  .input-btn {
    padding: 0;
    background-color: transparent;
    color: ${({ theme }) => theme.baseTextColor};
    cursor: pointer;
    font-size: ${({ theme }) => theme.fontSizes.small}px;
    text-decoration: none !important;
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;

    &:hover,
    &:focus {
      color: ${({ theme }) => theme.emphasizedTextColor};

      .truncated {
        background-color: ${({ theme }) => theme.subtleBackgroundColor};
      }

      .hoverIcon {
        opacity: 1;
      }
    }

    & > .icon {
      margin-right: 4px;
    }

    .hoverIcon {
      margin-left: 4px;
      opacity: 0;
    }

    .truncated {
      padding: 2px 5px;
      border-radius: 3px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      min-width: 0;
      display: flex;
      align-items: center;
    }
  }
`

export default EditableInput
