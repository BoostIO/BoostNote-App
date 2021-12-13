import React, { useMemo } from 'react'
import { useCallback } from 'react'
import MetadataContainerBreak from '../../../../design/components/organisms/MetadataContainer/atoms/MetadataContainerBreak'
import MetadataContainerRow from '../../../../design/components/organisms/MetadataContainer/molecules/MetadataContainerRow'
import {
  PropSubType,
  PropType,
  StaticPropType,
} from '../../../interfaces/db/props'
import {
  getDefaultColumnSuggestionsPerType,
  getDefaultStaticSuggestionsPerType,
  getIconPathOfPropType,
} from '../../../lib/props'
import { filterIter } from '../../../lib/utils/iterator'

export interface PropertySuggestion {
  name: string
  type: PropType | StaticPropType
  subType?: PropSubType
}

export interface PropRegisterSuggestionsListProps {
  disabled?: boolean
  suggestions: PropertySuggestion[]
  suggestionsHeader: string
  isNameValid?: (name: string) => boolean
  onPropCreate: (prop: {
    name: string
    type: PropType
    subType?: PropSubType
  }) => void
  onStaticPropCreate?: (prop: { name: string; prop: StaticPropType }) => void
  allowedPropTypes?: PropType[]
}

const PropRegisterSuggestionsList = ({
  suggestions,
  suggestionsHeader,
  disabled,
  isNameValid,
  onStaticPropCreate,
  onPropCreate,
}: PropRegisterSuggestionsListProps) => {
  const suggestionsBySection = useMemo(() => {
    let staticSuggestions: any[] =
      onStaticPropCreate == null
        ? getDefaultColumnSuggestionsPerType()
        : [
            ...getDefaultColumnSuggestionsPerType(),
            ...getDefaultStaticSuggestionsPerType(),
          ]

    const allowedSuggestionsNames = suggestions.map(
      (suggestion) => suggestion.name
    )

    staticSuggestions = filterIter(
      (suggestion) => !allowedSuggestionsNames.includes(suggestion.name),
      staticSuggestions
    )

    if (isNameValid != null) {
      staticSuggestions = filterIter(
        (suggestion) => isNameValid(suggestion.name),
        staticSuggestions
      )
    }

    return Object.entries({
      [suggestionsHeader]: suggestions.map((suggestion) => {
        return {
          name: suggestion.name,
          value: suggestion,
          icon: getIconPathOfPropType(suggestion.subType || suggestion.type),
        }
      }),
      Default: staticSuggestions.map((suggestion) => {
        return {
          name: suggestion.name,
          value: suggestion,
          icon: getIconPathOfPropType(suggestion.subType || suggestion.type),
        }
      }),
    })
  }, [suggestionsHeader, suggestions, onStaticPropCreate, isNameValid])

  const onSelect = useCallback(
    (selected: PropertySuggestion) => {
      if (
        selected.type === 'creation_date' ||
        selected.type === 'update_date' ||
        selected.type === 'label'
      ) {
        if (onStaticPropCreate == null) {
          return
        }

        return onStaticPropCreate({ name: selected.name, prop: selected.type })
      }

      return onPropCreate({
        name: selected.name,
        type: selected.type,
        subType: selected.subType,
      })
    },
    [onPropCreate, onStaticPropCreate]
  )

  return (
    <>
      {suggestionsBySection.map(([sectionName, sectionSuggestions], j) => (
        <>
          {sectionSuggestions.length > 0 && (
            <>
              <MetadataContainerRow
                row={{
                  type: 'header',
                  content: sectionName,
                }}
              />
              {sectionSuggestions.map((propSuggestion, i) => (
                <MetadataContainerRow
                  key={propSuggestion.name}
                  row={{
                    type: 'button',
                    props: {
                      label: propSuggestion.name,
                      iconPath: propSuggestion.icon,
                      disabled,
                      onClick: () => onSelect(propSuggestion.value),
                      id: `${sectionName}-${i}`,
                    },
                  }}
                />
              ))}
              {j !== suggestionsBySection.length - 1 &&
                suggestionsBySection[j + 1][1].length > 0 && (
                  <MetadataContainerBreak />
                )}
            </>
          )}
        </>
      ))}
    </>
  )
}

export default PropRegisterSuggestionsList
