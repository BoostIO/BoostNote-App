import React, { useCallback, useMemo, useRef, useState } from 'react'
import cc from 'classcat'
import styled from '../../../../design/lib/styled'
import PropertyValueButton from './PropertyValueButton'
import { SerializedStatus } from '../../../interfaces/db/status'
import { useStatuses } from '../../../lib/stores/status'
import { usePage } from '../../../lib/stores/pageStore'
import FormInput from '../../../../design/components/molecules/Form/atoms/FormInput'
import Spinner from '../../../../design/components/atoms/Spinner'
import { useUpDownNavigationListener } from '../../../lib/keyboard'
import { isChildNode } from '../../../lib/dom'

interface StatusSelectProps {
  sending?: boolean
  status?: SerializedStatus
  disabled?: boolean
  isErrored?: boolean
  isReadOnly: boolean
  onClick?: (event: React.MouseEvent) => void
  onStatusChange: (status: SerializedStatus | null) => void
}

const StatusSelect = ({
  status,
  sending,
  disabled,
  isErrored,
  isReadOnly,
  onStatusChange,
  onClick,
}: StatusSelectProps) => {
  const [showInput, setShowInput] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const onBlurHandler = useCallback((event: any) => {
    if (
      containerRef.current !== event.relatedTarget &&
      !isChildNode(
        containerRef.current,
        event.relatedTarget as HTMLElement | null
      )
    ) {
      setShowInput(false)
    }
  }, [])
  return (
    <Container
      onBlur={onBlurHandler}
      ref={containerRef}
      className={cc([
        'doc__tags__create',
        'item__status__select',
        'prop__margin',
      ])}
    >
      <PropertyValueButton
        sending={sending}
        isErrored={isErrored}
        isReadOnly={isReadOnly}
        empty={status == null}
        disabled={disabled}
        onClick={(e) =>
          onClick != null ? onClick(e) : setShowInput((prev) => !prev)
        }
      >
        {status != null ? (
          <StatusView
            name={status.name}
            backgroundColor={status.backgroundColor}
          />
        ) : (
          <StatusView name='No Status' />
        )}
      </PropertyValueButton>
      {showInput && (
        <StatusSelector
          onSelect={(status) => {
            onStatusChange(status)
            setShowInput(false)
          }}
        />
      )}
    </Container>
  )
}

export default StatusSelect

const StatusSelector = ({
  onSelect,
}: {
  onSelect: (status: SerializedStatus | null) => void
}) => {
  const { team } = usePage()
  const { state, addStatus } = useStatuses(team!.id)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [sending, setSending] = useState<boolean>(false)
  const [tagText, setTagText] = useState<string>('')

  const createStatusHandler = useCallback(
    async (name: string) => {
      if (sending || tagText.trim() === '') {
        return
      }
      setSending(true)
      await addStatus({ name, team: team!.id })
      setSending(false)
    },
    [team, addStatus, sending, tagText]
  )

  const inputOnChangeEvent = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      event.preventDefault()
      setTagText(event.target.value)
    },
    [setTagText]
  )

  const options = useMemo(() => {
    return state.statuses.filter((status) => status.name.startsWith(tagText))
  }, [state.statuses, tagText])

  const showCreate = useMemo(() => {
    return (
      tagText != '' && !state.statuses.some((status) => status.name === tagText)
    )
  }, [state.statuses, tagText])

  const showNoStatus = useMemo(() => {
    return tagText === '' || 'No Status'.startsWith(tagText)
  }, [tagText])

  useUpDownNavigationListener(containerRef, {
    overrideInput: true,
  })

  return (
    <div ref={containerRef} className='autocomplete__container'>
      <FormInput
        ref={inputRef}
        className='autocomplete__input'
        placeholder='Search Status...'
        value={tagText}
        onChange={inputOnChangeEvent}
        disabled={sending}
        autoComplete='off'
      />
      {state.isWorking && (
        <div className='autocomplete__spinner__wrapper'>
          <Spinner className='autocomplete__spinner' />
        </div>
      )}
      <div>
        {showCreate && (
          <a
            className='autocomplete__option'
            key={`option-autocomplete=create`}
            href='#'
            onClick={() => createStatusHandler(tagText)}
          >
            Create &quot;{tagText}&quot;
          </a>
        )}
        {showNoStatus && (
          <a
            className='autocomplete__option'
            key={`option-autocomplete=none`}
            href='#'
            onClick={() => onSelect(null)}
          >
            <StatusView name='No Status' />
          </a>
        )}
        {options.map((status) => (
          <a
            className='autocomplete__option'
            key={`option-autocomplete=${status.id}`}
            href='#'
            onClick={() => onSelect(status)}
          >
            <StatusView
              name={status.name}
              backgroundColor={status.backgroundColor}
            />
          </a>
        ))}
      </div>
    </div>
  )
}

const Container = styled.div`
  position: relative;

  .autocomplete__input {
    line-height: inherit !important;
    height: 28px !important;
    width: 100%;
  }

  .autocomplete__container {
    z-index: 9000;
    position: absolute;
    padding: ${({ theme }) => theme.sizes.spaces.xsm}px 0;
    max-width: auto;
    max-height: 300px;
    overflow-y: auto;
    border-style: solid;
    border-width: 1px;
    border-radius: 4px;
    display: inline-flex;
    flex-direction: column;
    border: none;
    left: 0;
    top: 100%;
    background-color: ${({ theme }) => theme.colors.background.primary};
    box-shadow: ${({ theme }) => theme.colors.shadow};
  }

  .autocomplete__option {
    width: 100%;
    display: block;
    flex-shrink: 0;
    padding: ${({ theme }) => theme.sizes.spaces.sm}px
      ${({ theme }) => theme.sizes.spaces.df}px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: ${({ theme }) => theme.colors.text.subtle};
    text-decoration: none;

    &:hover,
    &:focus {
      background: ${({ theme }) => theme.colors.background.quaternary};
      color: ${({ theme }) => theme.colors.text.primary};
    }
  }

  .autocomplete__spinner__wrapper {
    margin: 0 auto;
    padding: ${({ theme }) => theme.sizes.spaces.sm}px
      ${({ theme }) => theme.sizes.spaces.df}px;

    & > .autocomplete__spinner {
      border-color: ${({ theme }) => theme.colors.variants.primary.text};
      border-right-color: transparent;
      display: inline-flex;
    }
  }
`

const StatusView = ({
  name,
  backgroundColor,
}: {
  name: string
  backgroundColor?: string
}) => {
  return (
    <StyledStatus style={{ backgroundColor: backgroundColor || '#353940' }}>
      {name}
    </StyledStatus>
  )
}

const StyledStatus = styled.span`
  display: inline-block;
  padding: 0.25em 0.5em;
  border-radius: 4px;
  color: white;
`
