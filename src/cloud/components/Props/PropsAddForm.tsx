import React, { useMemo, useRef, useState } from 'react'
import { useEffectOnce } from 'react-use'
import ColoredBlock from '../../../design/components/atoms/ColoredBlock'
import FormInput from '../../../design/components/molecules/Form/atoms/FormInput'
import MetadataContainer from '../../../design/components/organisms/MetadataContainer'
import MetadataContainerRow from '../../../design/components/organisms/MetadataContainer/molecules/MetadataContainerRow'
import { useUpDownNavigationListener } from '../../lib/keyboard'

export interface Suggestion<T> {
  name: string
  icon?: string
  value: T
}

type PropsAddFormProps<T> = {
  value: string
  sending?: string
  suggestions: Record<string, Suggestion<T>[]>
  disabled?: boolean
  onChange: (value: string) => void
  onSelect: (selected: T) => void
  onCreate: (str: string) => void
  error?: string
}

const PropsAddForm = <T extends any>({
  value,
  sending,
  suggestions,
  onChange,
  onCreate,
  onSelect,
  disabled,
  error,
}: PropsAddFormProps<T>) => {
  const menuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffectOnce(() => {
    if (inputRef.current != null) {
      inputRef.current.focus()
      inputRef.current.setSelectionRange(0, value.length)
    }
  })

  useUpDownNavigationListener(menuRef, { overrideInput: true })

  const activeSuggestions = useMemo(() => {
    return Object.entries(suggestions)
      .map<[string, Suggestion<T>[]]>(([sectionName, sectionSuggestions]) => {
        return [
          sectionName,

          sectionSuggestions.filter((suggestion) => {
            return suggestion.name
              .toLocaleLowerCase()
              .startsWith(value.toLocaleLowerCase())
          }),
        ]
      })
      .filter(([, sectionSuggestions]) => sectionSuggestions.length > 0)
  }, [suggestions, value])

  return (
    <MetadataContainer>
      <MetadataContainerRow
        row={{
          type: 'content',
          content: (
            <FormInput
              id='col-name-input'
              placeholder='Type to search or add..'
              ref={inputRef}
              value={value}
              onChange={(ev) => onChange(ev.target.value)}
              disabled={disabled}
            />
          ),
        }}
      />
      {error == null && value.trim() !== '' && (
        <MetadataContainerRow
          row={{
            type: 'button',
            props: {
              label: `Create "${value}"`,
              id: `create-col`,
              onClick: () => onCreate(value),
            },
          }}
        />
      )}
      {error != null && value.trim() !== '' && (
        <MetadataContainerRow
          row={{
            type: 'content',
            content: <ColoredBlock variant='warning'>{error}</ColoredBlock>,
          }}
        />
      )}
      <>
        {activeSuggestions.map(([sectionName, sectionSuggestions]) => (
          <>
            <MetadataContainerRow
              row={{
                type: 'header',
                content: sectionName,
              }}
            />
            {sectionSuggestions.map((propSuggestion) => (
              <MetadataContainerRow
                key={propSuggestion.name}
                row={{
                  type: 'button',
                  props: {
                    label: propSuggestion.name,
                    iconPath: propSuggestion.icon,
                    disabled: error != null || sending != null,
                    onClick: () => onSelect(propSuggestion.value),
                  },
                }}
              />
            ))}
          </>
        ))}
      </>
    </MetadataContainer>
  )
}
export default PropsAddForm
