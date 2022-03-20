import React, { useCallback, useMemo, useState } from 'react'
import styled from '../../../../design/lib/styled'
import PropertyValueButton from './PropertyValueButton'
import { mdiLinkVariant, mdiPencil } from '@mdi/js'
import { useModal } from '../../../../design/lib/stores/modal'
import { useRef } from 'react'
import { useEffectOnce } from 'react-use'
import { isValidUrl } from '../../../../lib/string'
import { ExternalLink } from '../../../../design/components/atoms/Link'
import FormInput from '../../../../design/components/molecules/Form/atoms/FormInput'
import Button from '../../../../design/components/atoms/Button'
import Flexbox from '../../../../design/components/atoms/Flexbox'

interface UrlSelectProps {
  sending?: boolean
  value?: string
  disabled?: boolean
  isReadOnly: boolean
  showIcon?: boolean
  popupAlignment?: 'bottom-left' | 'top-left'
  onUrlChange: (text: string) => void
}

const UrlSelect = ({
  value = '',
  sending,
  disabled,
  isReadOnly,
  showIcon,
  popupAlignment = 'bottom-left',
  onUrlChange,
}: UrlSelectProps) => {
  const { openContextModal, closeLastModal } = useModal()
  const onUrlChangeCallback = useCallback(
    (newTextValue: string) => {
      onUrlChange(newTextValue)
    },
    [onUrlChange]
  )

  const openSelector: React.MouseEventHandler = useCallback(
    (event) => {
      event.stopPropagation()
      openContextModal(
        event,
        <UrlInputContextModal
          initialValue={value}
          onChange={(newValue) => {
            if (newValue !== value) {
              onUrlChangeCallback(newValue)
            }
            closeLastModal()
          }}
        />,
        {
          alignment: popupAlignment,
          width: 200,
          hideBackground: true,
          removePadding: true,
          keepAll: true,
        }
      )
    },
    [
      openContextModal,
      value,
      popupAlignment,
      onUrlChangeCallback,
      closeLastModal,
    ]
  )

  const labelNode = useMemo(() => {
    if (value.trim() === '') {
      return <div className='url-select__label'> </div>
    }

    if (isValidUrl(value)) {
      return (
        <ExternalLink href={value} className='url-select__label'>
          {value}
        </ExternalLink>
      )
    }

    return (
      <div className='url-select__label url-select__label--incorrect'>
        Incorrect url
      </div>
    )
  }, [value])

  const openSelectorIfEmpty = useCallback(
    (e) => {
      if (value.trim() === '' || !isValidUrl(value)) {
        openSelector(e)
      }
    },
    [openSelector, value]
  )

  return (
    <UrlSelectContainer>
      <PropertyValueButton
        onClick={(e) => openSelectorIfEmpty(e)}
        sending={sending}
        isReadOnly={isReadOnly}
        disabled={disabled}
        iconPath={showIcon ? mdiLinkVariant : undefined}
        className='url__button'
        tag='div'
      >
        <Flexbox justifyContent='space-between'>
          {labelNode}
          {!isReadOnly && !disabled && (
            <Button
              variant='bordered'
              className='url__button__edit'
              iconPath={mdiPencil}
              iconSize={16}
              onClick={openSelector}
              size='sm'
            />
          )}
        </Flexbox>
      </PropertyValueButton>
    </UrlSelectContainer>
  )
}

export default UrlSelect

const UrlSelectContainer = styled.div`
  .url-select__label {
    padding: 0px;
    border-radius: 4px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    line-height: 25px;
    width: 100%;

    &.url-select__label--incorrect {
      color: ${({ theme }) => theme.colors.text.subtle};
      font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
    }
  }

  .url__button__edit {
    flex: 0 0 auto;
    display: none;
  }

  .url__button:hover .url__button__edit {
    display: flex;
  }
`

const UrlInputContextModal = ({
  initialValue: initialText,
  onChange,
}: {
  initialValue: string
  onChange: (newValue: string) => void
}) => {
  const [value, setValue] = useState<string>(initialText)
  const inputRef = useRef<HTMLInputElement>(null)

  const inputOnChangeEvent = useCallback((event) => {
    event.preventDefault()
    setValue(event.target.value)
  }, [])

  const updateValue = useCallback(() => {
    onChange(value)
  }, [value, onChange])

  useEffectOnce(() => {
    if (inputRef.current != null) {
      inputRef.current.focus()
      inputRef.current.setSelectionRange(0, initialText.length)
    }
  })

  const handleKeyPress = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        onChange(value)
      }
    },
    [onChange, value]
  )

  return (
    <FormInputContainer
      ref={inputRef}
      type='text'
      value={value}
      onChange={inputOnChangeEvent}
      autoComplete={'off'}
      placeholder={'url...'}
      onBlur={updateValue}
      onKeyPress={handleKeyPress}
    />
  )
}

const FormInputContainer = styled(FormInput)`
  width: 100%;
`
