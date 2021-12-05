import React, { useCallback, useState } from 'react'
import styled from '../../../../design/lib/styled'
import PropertyValueButton from './PropertyValueButton'
import { mdiArrowDownDropCircleOutline } from '@mdi/js'
import { useModal } from '../../../../design/lib/stores/modal'
import Button from '../../../../design/components/atoms/Button'
import ErrorBlock from '../../ErrorBlock'
import FormTextArea from '../../../../design/components/molecules/Form/atoms/FormTextArea'

interface TextSelectProps {
  sending?: boolean
  initialText?: string
  disabled?: boolean
  isReadOnly: boolean
  emptyLabel?: string
  showIcon?: boolean
  popupAlignment?: 'bottom-left' | 'top-left'
  onClick?: (event: React.MouseEvent) => void
  onTextChange: (text: string) => void
}

const TextSelect = ({
  initialText = '',
  sending,
  disabled,
  emptyLabel,
  isReadOnly,
  showIcon,
  popupAlignment = 'bottom-left',
  onTextChange,
  onClick,
}: TextSelectProps) => {
  const { openContextModal, closeLastModal } = useModal()
  const onTextChangeCallback = useCallback(
    (newTextValue: string) => {
      onTextChange(newTextValue)
    },
    [onTextChange]
  )

  const openSelector: React.MouseEventHandler = useCallback(
    (ev) => {
      openContextModal(
        ev,
        <TextSelector
          initialText={initialText}
          onSelect={(newTextValue) => {
            onTextChangeCallback(newTextValue)
            closeLastModal()
          }}
        />,
        { alignment: popupAlignment, width: 191, removePadding: true }
      )
    },
    [
      openContextModal,
      initialText,
      popupAlignment,
      onTextChangeCallback,
      closeLastModal,
    ]
  )
  return (
    <ShowcaseContainer>
      <PropertyValueButton
        sending={sending}
        isReadOnly={isReadOnly}
        disabled={disabled}
        onClick={(e) => (onClick != null ? onClick(e) : openSelector(e))}
        iconPath={showIcon ? mdiArrowDownDropCircleOutline : undefined}
      >
        {initialText != null && initialText != '' ? (
          <TextView name={initialText} />
        ) : emptyLabel != null ? (
          emptyLabel
        ) : (
          <TextView name='Click to set' />
        )}
      </PropertyValueButton>
    </ShowcaseContainer>
  )
}

export default TextSelect

const TextSelector = ({
  initialText,
  onSelect,
}: {
  initialText: string
  onSelect: (newTextValue: string) => void
}) => {
  const [textValue, setTextValue] = useState<string>(initialText + '')
  const [error, setError] = useState<string | null>(null)

  const inputOnChangeEvent = useCallback((event) => {
    event.preventDefault()
    setTextValue(event.target.value)
  }, [])

  const validateAndUpdateText = useCallback(
    (newValue: string) => {
      if (newValue === '') {
        setError('Cannot be empty')
      } else {
        onSelect(textValue)
      }
    },
    [textValue, onSelect]
  )

  return (
    <Container>
      <FormTextArea
        className={'form--input'}
        type='text'
        value={textValue}
        onChange={inputOnChangeEvent}
        autoComplete={'off'}
        placeholder={'Type anything...'}
        onBlur={(e) => validateAndUpdateText(e.target.value)}
      />
      <Button
        className={'save--button'}
        onClick={() => validateAndUpdateText(textValue)}
        variant={'primary'}
      >
        Save
      </Button>
      {error != null && <ErrorBlock error={error} />}
    </Container>
  )
}

const ShowcaseContainer = styled.div`
  .item__property__button__label {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
`

const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  flex-wrap: wrap;
  margin-left: 4px;

  .form--input {
    width: 100%;
    margin: 5px;
  }

  .save--button {
    margin: 5px;
  }
`
export const TextView = ({
  name,
  backgroundColor,
}: {
  name: string
  backgroundColor?: string
}) => {
  return <StyledTextView style={{ backgroundColor }}>{name}</StyledTextView>
}

const StyledTextView = styled.span`
  padding: 0.25em 0.5em;
  border-radius: 4px;
  color: white;
`
