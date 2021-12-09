import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { mdiDotsHorizontal, mdiTrashCanOutline } from '@mdi/js'
import { useEffectOnce } from 'react-use'
import { capitalize, getColorFromString } from '../../../cloud/lib/utils/string'
import { useModal } from '../../lib/stores/modal'
import Flexbox from '../atoms/Flexbox'
import Icon from '../atoms/Icon'
import Spinner from '../atoms/Spinner'
import FormInput from './Form/atoms/FormInput'
import styled from '../../lib/styled'
import MetadataContainerRow from '../organisms/MetadataContainer/molecules/MetadataContainerRow'
import FormColorSelect from './Form/atoms/FormColorSelect'
import MetadataContainer from '../organisms/MetadataContainer'
import { Label } from '../atoms/Label'
import { useUpDownNavigationListener } from '../../../cloud/lib/keyboard'

export interface LabelLike {
  name: string
  backgroundColor?: string
  hide?: boolean
}

interface LabelManagerProps<T extends LabelLike> {
  labels: T[]
  onSelect: (label: T | null) => void
  onCreate: (label: LabelLike) => void
  onUpdate: (label: T) => void
  onDelete: (label: T) => void
  sending?: boolean
  type?: string
  allowEmpty?: boolean
}

const LabelManager = <T extends LabelLike>({
  labels,
  onSelect,
  onCreate,
  onUpdate,
  onDelete,
  type = 'label',
  sending = false,
  allowEmpty = false,
}: LabelManagerProps<T>) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [labelName, setLabelName] = useState<string>('')
  const { openContextModal, closeLastModal } = useModal()

  useEffectOnce(() => {
    if (inputRef.current != null) {
      inputRef.current.focus()
    }
  })

  const createStatusHandler = useCallback(
    async (name: string) => {
      if (sending || labelName.trim() === '') {
        return
      }
      onCreate({ name, backgroundColor: getColorFromString(name) })
    },
    [sending, labelName, onCreate]
  )

  const inputOnChangeEvent = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      event.preventDefault()
      setLabelName(event.target.value)
    },
    [setLabelName]
  )

  const openEditor = useCallback(
    (ev: React.MouseEvent, label: T) => {
      ev.stopPropagation()
      ev.preventDefault()
      openContextModal(
        ev,
        <StatusEditor
          label={label}
          onDelete={(label) => {
            onDelete(label)
            closeLastModal()
          }}
          onSave={onUpdate}
          type={type}
        />,
        {
          removePadding: true,
          width: 200,
          keepAll: true,
        }
      )
    },
    [openContextModal, onDelete, onUpdate, closeLastModal, type]
  )

  const options = useMemo(() => {
    return labels.filter(
      (label) => label.name.startsWith(labelName) && !label.hide
    )
  }, [labels, labelName])

  const showCreate = useMemo(() => {
    return (
      labelName != '' && !labels.some((status) => status.name === labelName)
    )
  }, [labels, labelName])

  const showNoStatus = useMemo(() => {
    return (
      (labelName === '' || `No ${capitalize(type)}`.startsWith(labelName)) &&
      allowEmpty
    )
  }, [labelName, allowEmpty, type])

  useUpDownNavigationListener(containerRef, {
    overrideInput: true,
  })

  return (
    <Container ref={containerRef} className='autocomplete__container'>
      <FormInput
        ref={inputRef}
        className='autocomplete__input'
        placeholder='Type to search or add..'
        value={labelName}
        onChange={inputOnChangeEvent}
        disabled={sending}
        autoComplete='off'
      />
      {sending && (
        <div className='autocomplete__spinner__wrapper'>
          <Spinner className='autocomplete__spinner' />
        </div>
      )}
      <div>
        {showCreate && (
          <a
            className='autocomplete__option'
            key={`option-autocomplete=create`}
            id={`option-autocomplete-create`}
            href='#'
            onClick={() => createStatusHandler(labelName)}
          >
            Create &quot;{labelName}&quot;
          </a>
        )}
        {showNoStatus && (
          <a
            className='autocomplete__option'
            key={`option-autocomplete=none`}
            id={`option-autocomplete-none`}
            href='#'
            onClick={() => onSelect(null)}
          >
            <Label name='No Status' />
          </a>
        )}
        {options.map((label) => (
          <a
            className='autocomplete__option'
            key={`option-autocomplete=${label.name}`}
            href='#'
            onClick={() => onSelect(label)}
            id={`option-autocomplete-${label.name}`}
          >
            <Flexbox justifyContent='space-between'>
              <Label
                name={label.name}
                backgroundColor={label.backgroundColor}
              />
              <span onClick={(ev) => openEditor(ev, label)}>
                <Icon path={mdiDotsHorizontal} />
              </span>
            </Flexbox>
          </a>
        ))}
      </div>
    </Container>
  )
}

export default LabelManager

interface StatusEditorProps<T extends LabelLike> {
  label: T
  onDelete: (status: T) => void
  onSave: (status: T) => void
  type?: string
}

const StatusEditor = <T extends LabelLike>({
  label,
  onDelete,
  onSave,
  type = 'label',
}: StatusEditorProps<T>) => {
  const [editingStatus, setEditingStatus] = useState(label)
  const editingStatusRef = useRef(label)
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
        editingStatusRef.current.name !== label.name ||
        editingStatusRef.current.backgroundColor !== label.backgroundColor
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
      <MetadataContainerRow
        row={{ type: 'header', content: `${type.toUpperCase()} TITLE` }}
      />
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
