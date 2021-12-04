import React, { useCallback, useState } from 'react'
import styled from '../../../../design/lib/styled'
import PropertyValueButton from './PropertyValueButton'
import FormInput from '../../../../design/components/molecules/Form/atoms/FormInput'
import { mdiArrowDownDropCircleOutline } from '@mdi/js'
import { useModal } from '../../../../design/lib/stores/modal'
import Button from '../../../../design/components/atoms/Button'
import ErrorBlock from '../../ErrorBlock'

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
  number = 0,
  sending,
  disabled,
  emptyLabel,
  isReadOnly,
  showIcon,
  popupAlignment = 'bottom-left',
  onNumberChange,
  onClick,
}: NumberSelectProps) => {
  const { openContextModal, closeLastModal } = useModal()
  const onNumberChangeCallback = useCallback(
    (number: number) => {
      onNumberChange(number)
    },
    [onNumberChange]
  )

  const openSelector: React.MouseEventHandler = useCallback(
    (ev) => {
      openContextModal(
        ev,
        <NumberSelector
          number={number}
          onSelect={(number) => {
            onNumberChangeCallback(number)
            closeLastModal()
          }}
        />,
        { alignment: popupAlignment, width: 191, removePadding: true }
      )
    },
    [
      openContextModal,
      number,
      popupAlignment,
      onNumberChangeCallback,
      closeLastModal,
    ]
  )

  return (
    <div>
      <PropertyValueButton
        sending={sending}
        isReadOnly={isReadOnly}
        disabled={disabled}
        onClick={(e) => (onClick != null ? onClick(e) : openSelector(e))}
        iconPath={showIcon ? mdiArrowDownDropCircleOutline : undefined}
      >
        {number != null ? (
          <NumberView name={number + ''} />
        ) : emptyLabel != null ? (
          emptyLabel
        ) : (
          <NumberView name='Click to set' />
        )}
      </PropertyValueButton>
    </div>
  )
}

export default NumberSelect

const NumberSelector = ({
  number,
  onSelect,
}: {
  number: number
  onSelect: (number: number) => void
}) => {
  const [numberValue, setNumberValue] = useState<string>(number + '')
  const [error, setError] = useState<string | null>(null)

  const inputOnChangeEvent = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      event.preventDefault()
      setNumberValue(event.target.value)
    },
    []
  )

  const validateAndUpdateNumber = useCallback(
    (newValue: string) => {
      const number = parseInt(newValue)
      if (isNaN(number)) {
        setError('Not a number')
      } else {
        onSelect(number)
      }
    },
    [onSelect]
  )

  return (
    <Container>
      <FormInput
        className={'form--input'}
        type='number'
        value={numberValue}
        onChange={inputOnChangeEvent}
        autoComplete={'off'}
      />
      <Button
        className={'save--button'}
        onClick={() => validateAndUpdateNumber(numberValue)}
        variant={'primary'}
      >
        Save
      </Button>
      {error != null && <ErrorBlock error={error} />}
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  flex-wrap: wrap;
  margin-left: 4px;

  .form--input {
    width: 50%;
    margin: 5px;
  }

  .save--button {
    margin: 5px;
  }
`
export const NumberView = ({
  name,
  backgroundColor,
}: {
  name: string
  backgroundColor?: string
}) => {
  return <StyledStatus style={{ backgroundColor }}>{name}</StyledStatus>
}

const StyledStatus = styled.span`
  display: inline-block;
  padding: 0.25em 0.5em;
  border-radius: 4px;
  color: white;
`
