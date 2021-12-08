import React, { useCallback, useRef, useState } from 'react'
import styled from '../../../../design/lib/styled'
import PropertyValueButton from './PropertyValueButton'
import FormInput from '../../../../design/components/molecules/Form/atoms/FormInput'
import { mdiArrowDownDropCircleOutline } from '@mdi/js'
import { useModal } from '../../../../design/lib/stores/modal'
import { useEffectOnce } from 'react-use'

interface NumberSelectProps {
  sending?: boolean
  number?: number
  disabled?: boolean
  isReadOnly: boolean
  emptyLabel?: string
  showIcon?: boolean
  popupAlignment?: 'bottom-left' | 'top-left'
  onClick?: (event: React.MouseEvent) => void
  onNumberChange: (number: number) => void
}

const NumberSelect = ({
  number,
  sending,
  disabled,
  isReadOnly,
  showIcon,
  popupAlignment = 'bottom-left',
  onNumberChange,
}: NumberSelectProps) => {
  const { openContextModal, closeLastModal } = useModal()

  const openSelector: React.MouseEventHandler = useCallback(
    (event) => {
      openContextModal(
        event,
        <NumberInputContextModal
          initialValue={number}
          onSelect={(newValue) => {
            const parsedNewValue = parseFloat(newValue)
            if (!Number.isNaN(parsedNewValue)) {
              onNumberChange(parsedNewValue)
            }

            closeLastModal()
          }}
        />,
        { alignment: popupAlignment, width: 191, removePadding: true }
      )
    },
    [openContextModal, number, popupAlignment, closeLastModal, onNumberChange]
  )

  return (
    <NumberSelectContainer>
      <PropertyValueButton
        sending={sending}
        isReadOnly={isReadOnly}
        disabled={disabled}
        onClick={openSelector}
        iconPath={showIcon ? mdiArrowDownDropCircleOutline : undefined}
      >
        <div className='number-select__label'>{number}</div>
      </PropertyValueButton>
    </NumberSelectContainer>
  )
}

export default NumberSelect

const NumberSelectContainer = styled.div`
  .number-select__label {
    padding: 0.25em 0.5em;
    border-radius: 4px;
    color: white;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
`

interface NumberInputContextModalProps {
  initialValue?: number
  onSelect: (value: string) => void
}

const NumberInputContextModal = ({
  initialValue,
  onSelect,
}: NumberInputContextModalProps) => {
  const [value, setValue] = useState<string>(
    initialValue != null ? initialValue.toString() : ''
  )
  const inputRef = useRef<HTMLInputElement>(null)

  const inputOnChangeEvent = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      event.preventDefault()
      setValue(event.target.value)
    },
    []
  )

  const updateNumber = useCallback(() => {
    onSelect(value)
  }, [onSelect, value])

  useEffectOnce(() => {
    if (inputRef.current != null) {
      inputRef.current.focus()
    }
  })

  return (
    <NumberInputContextModalContainer>
      <FormInput
        ref={inputRef}
        className={'form__input'}
        type='number'
        value={value}
        onChange={inputOnChangeEvent}
        autoComplete={'off'}
        onBlur={updateNumber}
      />
    </NumberInputContextModalContainer>
  )
}

const NumberInputContextModalContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  flex-wrap: wrap;
  margin-left: 4px;

  .form__input {
    display: block;
    width: 100%;
    margin: 5px;
  }
`
