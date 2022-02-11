import React, { useCallback, useState } from 'react'
import styled from '../../../../design/lib/styled'
import PropertyValueButton from './PropertyValueButton'
import { mdiFormatText } from '@mdi/js'
import { useModal } from '../../../../design/lib/stores/modal'
import FormTextArea from '../../../../design/components/molecules/Form/atoms/FormTextArea'
import { useRef } from 'react'
import { useEffectOnce } from 'react-use'

interface TextSelectProps {
  sending?: boolean
  value?: string
  disabled?: boolean
  isReadOnly: boolean
  showIcon?: boolean
  popupAlignment?: 'bottom-left' | 'top-left'
  onTextChange: (text: string) => void
}

const TextSelect = ({
  value = '',
  sending,
  disabled,
  isReadOnly,
  showIcon,
  popupAlignment = 'bottom-left',
  onTextChange,
}: TextSelectProps) => {
  const { openContextModal, closeLastModal } = useModal()
  const onTextChangeCallback = useCallback(
    (newTextValue: string) => {
      onTextChange(newTextValue)
    },
    [onTextChange]
  )

  const openSelector: React.MouseEventHandler = useCallback(
    (event) => {
      openContextModal(
        event,
        <TextInputContextModal
          initialValue={value}
          onSelect={(newValue) => {
            if (newValue !== value) {
              onTextChangeCallback(newValue)
            }
            closeLastModal()
          }}
        />,
        {
          alignment: popupAlignment,
          width: 191,
          removePadding: true,
          keepAll: true,
        }
      )
    },
    [
      openContextModal,
      value,
      popupAlignment,
      onTextChangeCallback,
      closeLastModal,
    ]
  )
  return (
    <TextSelectContainer>
      <PropertyValueButton
        sending={sending}
        isReadOnly={isReadOnly}
        disabled={disabled}
        onClick={openSelector}
        iconPath={showIcon ? mdiFormatText : undefined}
      >
        <div className='text-select__label'>{value}</div>
      </PropertyValueButton>
    </TextSelectContainer>
  )
}

export default TextSelect

const TextSelectContainer = styled.div`
  .text-select__label {
    border-radius: 4px;
    color: white;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
`

interface TextInputContextModalProps {
  initialValue: string
  onSelect: (newValue: string) => void
}

const TextInputContextModal = ({
  initialValue: initialText,
  onSelect,
}: TextInputContextModalProps) => {
  const [textValue, setTextValue] = useState<string>(initialText)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const inputOnChangeEvent = useCallback((event) => {
    event.preventDefault()
    setTextValue(event.target.value)
  }, [])

  const updateValue = useCallback(() => {
    onSelect(textValue)
  }, [textValue, onSelect])

  useEffectOnce(() => {
    if (inputRef.current != null) {
      inputRef.current.focus()
    }
  })

  const handleKeyPress = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        onSelect(textValue)
      }
    },
    [onSelect, textValue]
  )

  return (
    <TextInputContextModalContainer>
      <FormTextArea
        ref={inputRef}
        className={'form__input'}
        type='text'
        value={textValue}
        onChange={inputOnChangeEvent}
        autoComplete={'off'}
        placeholder={'Type anything...'}
        onBlur={updateValue}
        onKeyPress={handleKeyPress}
      />
    </TextInputContextModalContainer>
  )
}

const TextInputContextModalContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  flex-wrap: wrap;
  padding: 4px;

  .form__input {
    width: 100%;
  }
`
