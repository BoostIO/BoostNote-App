import React, { useCallback, useState } from 'react'
import { useEffectOnce } from 'react-use'
import Button from '../../../../design/components/atoms/Button'
import MetadataContainerRow from '../../../../design/components/organisms/MetadataContainer/molecules/MetadataContainerRow'
import styled from '../../../../design/lib/styled'
import {
  PropSubType,
  PropType,
  StaticPropType,
} from '../../../interfaces/db/props'
import { filterIter } from '../../../lib/utils/iterator'
import PropRegisterCreationForm from './PropRegisterCreationForm'
import PropRegisterSuggestionsList, {
  PropertySuggestion,
} from './PropRegisterSuggestionsList'

type PropRegisterFormState = 'suggestions' | 'creation'

type PropBody = {
  name: string
  type: PropType
  subType?: PropSubType
}

type StaticPropBody = { name: string; prop: StaticPropType }

export interface PropRegisterFormProps {
  suggestionsHeader?: string
  initialState?: PropRegisterFormState
  registerProp: (prop: PropBody) => void
  registerStaticProp?: (prop: StaticPropBody) => void
  fetchPropertySuggestions: () => Promise<PropertySuggestion[]>
  isNameValid?: (name: string) => boolean
}

const PropRegisterForm = ({
  suggestionsHeader = 'From Child Docs',
  initialState = 'suggestions',
  isNameValid,
  fetchPropertySuggestions,
  registerProp,
  registerStaticProp,
}: PropRegisterFormProps) => {
  const [formState, setFormState] = useState<PropRegisterFormState>(
    initialState
  )
  const [suggestions, setSuggestions] = useState<PropertySuggestion[]>([])
  const [sending, setSending] = useState(false)

  useEffectOnce(() => {
    fetchSuggestions()
  })

  const fetchSuggestions = useCallback(async () => {
    const results = await fetchPropertySuggestions()
    setSuggestions(
      isNameValid == null
        ? results
        : filterIter((suggestion) => isNameValid(suggestion.name), results)
    )
  }, [fetchPropertySuggestions, isNameValid])

  const onPropCreate = useCallback(
    (prop: PropBody) => {
      setSending(true)
      return registerProp(prop)
    },
    [registerProp]
  )

  return (
    <>
      <MetadataContainerRow
        row={{
          type: 'content',
          content: (
            <FormHeaderContainer>
              <Button
                active={formState === 'suggestions'}
                variant='transparent'
                onClick={() => setFormState('suggestions')}
              >
                Suggestions
              </Button>
              <Button
                active={formState === 'creation'}
                variant='transparent'
                onClick={() => setFormState('creation')}
              >
                Create
              </Button>
            </FormHeaderContainer>
          ),
        }}
      />
      <MetadataContainerRow
        row={{
          type: 'content',
          content:
            formState === 'creation' ? (
              <PropRegisterCreationForm
                onPropCreate={onPropCreate}
                isNameValid={isNameValid}
                disabled={sending}
              />
            ) : (
              <PropRegisterSuggestionsList
                onPropCreate={onPropCreate}
                onStaticPropCreate={
                  registerStaticProp != null
                    ? (prop) => {
                        setSending(true)
                        return registerStaticProp(prop)
                      }
                    : undefined
                }
                isNameValid={isNameValid}
                suggestions={suggestions}
                suggestionsHeader={suggestionsHeader}
                disabled={sending}
              />
            ),
        }}
      />
    </>
  )
}

const FormHeaderContainer = styled.div`
  display: flex;
  padding: 0px ${({ theme }) => theme.sizes.spaces.sm}px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.background.quaternary};

  button {
    border-radius: 0;
    padding: 0px ${({ theme }) => theme.sizes.spaces.xsm}px;
    border-bottom: 4px solid transparent;
    &.button__state--active {
      border-bottom-color: ${({ theme }) => theme.colors.variants.primary.base};
    }

    &:focus {
      box-shadow: none !important;
    }
  }
`

export default PropRegisterForm
