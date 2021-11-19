import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import cc from 'classcat'
import styled from '../../../../design/lib/styled'
import PropertyValueButton from './PropertyValueButton'
import { SerializedStatus } from '../../../interfaces/db/status'
import { useStatuses } from '../../../lib/stores/status'
import { usePage } from '../../../lib/stores/pageStore'
import FormInput from '../../../../design/components/molecules/Form/atoms/FormInput'
import Spinner from '../../../../design/components/atoms/Spinner'
import { useUpDownNavigationListener } from '../../../lib/keyboard'
import MetadataContainer from '../../../../design/components/organisms/MetadataContainer'
import MetadataContainerRow from '../../../../design/components/organisms/MetadataContainer/molecules/MetadataContainerRow'
import {
  mdiArrowDownDropCircleOutline,
  mdiDotsHorizontal,
  mdiTrashCanOutline,
} from '@mdi/js'
import { useModal } from '../../../../design/lib/stores/modal'
import Flexbox from '../../../../design/components/atoms/Flexbox'
import Icon from '../../../../design/components/atoms/Icon'
import { useEffectOnce } from 'react-use'
import FormColorSelect from '../../../../design/components/molecules/Form/atoms/FormColorSelect'

interface StatusSelectProps {
  sending?: boolean
  status?: SerializedStatus
  disabled?: boolean
  isReadOnly: boolean
  emptyLabel?: string
  showIcon?: boolean
  popupAlignment?: 'bottom-left' | 'top-left'
  onClick?: (event: React.MouseEvent) => void
  onStatusChange: (status: SerializedStatus | null) => void
}

const StatusSelect = ({
  status,
  sending,
  disabled,
  emptyLabel,
  isReadOnly,
  showIcon,
  popupAlignment = 'bottom-left',
  onStatusChange,
  onClick,
}: StatusSelectProps) => {
  const { openContextModal, closeLastModal } = useModal()
  const onStatusChangeRef = useRef(onStatusChange)
  useEffect(() => {
    onStatusChangeRef.current = onStatusChange
  }, [onStatusChange])

  const openSelector: React.MouseEventHandler = useCallback(
    (ev) => {
      openContextModal(
        ev,
        <StatusSelector
          onSelect={(status) => {
            onStatusChangeRef.current(status)
            closeLastModal()
          }}
        />,
        { alignment: popupAlignment, width: 200, removePadding: true }
      )
    },
    [openContextModal, closeLastModal, popupAlignment]
  )

  return (
    <div className={cc(['item__status__select', 'prop__margin'])}>
      <PropertyValueButton
        sending={sending}
        isReadOnly={isReadOnly}
        disabled={disabled}
        onClick={(e) => (onClick != null ? onClick(e) : openSelector(e))}
        iconPath={showIcon ? mdiArrowDownDropCircleOutline : undefined}
      >
        {status != null ? (
          <StatusView
            name={status.name}
            backgroundColor={status.backgroundColor}
          />
        ) : emptyLabel != null ? (
          emptyLabel
        ) : (
          <StatusView name='No Status' />
        )}
      </PropertyValueButton>
    </div>
  )
}

export default StatusSelect

const StatusSelector = ({
  onSelect,
}: {
  onSelect: (status: SerializedStatus | null) => void
}) => {
  const { team } = usePage()
  const { state, addStatus, removeStatus, editStatus } = useStatuses(team!.id)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [sending, setSending] = useState<boolean>(false)
  const [tagText, setTagText] = useState<string>('')
  const { openContextModal, closeLastModal } = useModal()

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

  const openEditor = useCallback(
    (ev: React.MouseEvent, status: SerializedStatus) => {
      ev.stopPropagation()
      ev.preventDefault()
      openContextModal(
        ev,
        <StatusEditor
          status={status}
          onDelete={(status) => {
            removeStatus(status)
            closeLastModal()
          }}
          onSave={(status) => {
            editStatus(status)
          }}
        />,
        {
          removePadding: true,
          width: 200,
          keepAll: true,
        }
      )
    },
    [openContextModal, removeStatus, editStatus, closeLastModal]
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
    <Container ref={containerRef} className='autocomplete__container'>
      <FormInput
        ref={inputRef}
        className='autocomplete__input'
        placeholder='Type to search or add..'
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
            <Flexbox justifyContent='space-between'>
              <StatusView
                name={status.name}
                backgroundColor={status.backgroundColor}
              />
              <span onClick={(ev) => openEditor(ev, status)}>
                <Icon path={mdiDotsHorizontal} />
              </span>
            </Flexbox>
          </a>
        ))}
      </div>
    </Container>
  )
}

interface StatusEditorProps {
  status: SerializedStatus
  onDelete: (status: SerializedStatus) => void
  onSave: (status: SerializedStatus) => void
}

const StatusEditor = ({ status, onDelete, onSave }: StatusEditorProps) => {
  const [editingStatus, setEditingStatus] = useState(status)
  const editingStatusRef = useRef(status)
  const onSaveRef = useRef(onSave)

  useEffect(() => {
    editingStatusRef.current = editingStatus
  }, [editingStatus])

  useEffect(() => {
    onSaveRef.current = onSave
  }, [onSave])

  useEffectOnce(() => {
    return () => {
      if (
        editingStatusRef.current.name !== status.name ||
        editingStatusRef.current.backgroundColor !== status.backgroundColor
      ) {
        onSaveRef.current(editingStatusRef.current)
      }
    }
  })

  const setName: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (ev) => {
      const name = ev.target.value
      setEditingStatus((prev) => ({ ...prev, name }))
    },
    []
  )
  const setColor = useCallback((backgroundColor: string) => {
    setEditingStatus((prev) => ({
      ...prev,
      backgroundColor: backgroundColor === '' ? undefined : backgroundColor,
    }))
  }, [])

  return (
    <MetadataContainer>
      <MetadataContainerRow row={{ type: 'header', content: 'STATUS TITLE' }} />
      <MetadataContainerRow
        row={{
          type: 'content',
          content: <FormInput value={editingStatus.name} onChange={setName} />,
        }}
      />
      <MetadataContainerRow row={{ type: 'header', content: 'COLOR' }} />
      <MetadataContainerRow
        row={{
          type: 'content',
          content: (
            <FormColorSelect
              value={editingStatus.backgroundColor || ''}
              onChange={setColor}
            />
          ),
        }}
      />
      <MetadataContainerRow
        row={{
          type: 'button',
          props: {
            label: 'Delete',
            iconPath: mdiTrashCanOutline,
            onClick: () => onDelete(editingStatus),
          },
        }}
      />
    </MetadataContainer>
  )
}

const Container = styled.div`
  .autocomplete__input {
    line-height: inherit !important;
    height: 28px !important;
    width: 100%;
  }

  .autocomplete__container {
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
    position: relative;

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

  .status__editor {
    position: absolute;
    top: 0;
    left: 100%;
  }
`

export const StatusView = ({
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
  background-color: #353940;
`
