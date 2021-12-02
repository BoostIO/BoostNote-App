import { mdiArrowLeft } from '@mdi/js'
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useEffectOnce } from 'react-use'
import Button from '../../../design/components/atoms/Button'
import ColoredBlock from '../../../design/components/atoms/ColoredBlock'
import FormInput from '../../../design/components/molecules/Form/atoms/FormInput'
import MetadataContainer from '../../../design/components/organisms/MetadataContainer'
import MetadataContainerRow from '../../../design/components/organisms/MetadataContainer/molecules/MetadataContainerRow'
import { focusFirstChildFromElement } from '../../../design/lib/dom'
import styled from '../../../design/lib/styled'
import {
  PropSubType,
  PropType,
  StaticPropType,
} from '../../interfaces/db/props'
import { useUpDownNavigationListener } from '../../lib/keyboard'
import {
  getDefaultColumnSuggestionsPerType,
  getDefaultStaticSuggestionsPerType,
  getIconPathOfPropType,
  getLabelOfPropType,
} from '../../lib/props'

type PropsAddFormProps = {
  isColumnNameInvalid: boolean
  columnName: string
  allocatedNames: string[]
  sending?: string
  fetchPropertySuggestions: () => Promise<PropertySuggestions[]>
  setColumnName: React.Dispatch<React.SetStateAction<string>>
  addNewPropCol: (name: string, type: PropType, subType?: PropSubType) => void
} & (
  | {
      showDocPageForm: true
      addNewStaticCol: undefined
    }
  | {
      showDocPageForm: false
      addNewStaticCol: (name: string, prop: StaticPropType) => void
    }
)

interface PropertySuggestions {
  name: string
  type: PropType | StaticPropType
  subType?: PropSubType
}

const PropsAddForm = ({
  columnName,
  allocatedNames,
  isColumnNameInvalid,
  sending,
  showDocPageForm,
  setColumnName,
  fetchPropertySuggestions,
  addNewPropCol,
  addNewStaticCol,
}: PropsAddFormProps) => {
  const menuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [suggestions, setSuggestions] = useState<PropertySuggestions[]>([])
  const [showCreationForm, setShowCreationForm] = useState(false)
  const screenFormRef = useRef(showCreationForm)

  useEffectOnce(() => {
    if (inputRef.current != null) {
      inputRef.current.focus()
      inputRef.current.setSelectionRange(0, columnName.length)
    }
    fetchSuggestions()
  })

  useEffect(() => {
    if (screenFormRef.current !== showCreationForm) {
      screenFormRef.current === showCreationForm
      if (menuRef.current != null) {
        focusFirstChildFromElement(menuRef.current)
      }
    }
  }, [showCreationForm])

  useUpDownNavigationListener(menuRef, { overrideInput: true })

  const fetchSuggestions = useCallback(async () => {
    const results = await fetchPropertySuggestions()
    setSuggestions(results)
  }, [fetchPropertySuggestions])

  const allowedSuggestions = useMemo(() => {
    const clearedSuggestions = suggestions.filter((suggestion) => {
      return !allocatedNames.includes(suggestion.name)
    })

    if (columnName.trim() === '') {
      return clearedSuggestions
    }

    return clearedSuggestions.filter((suggestion) => {
      return suggestion.name
        .toLocaleLowerCase()
        .startsWith(columnName.toLocaleLowerCase())
    })
  }, [suggestions, columnName, allocatedNames])

  const filteredDefaultSuggestions = useMemo(() => {
    let staticSuggestions = showDocPageForm
      ? []
      : getDefaultStaticSuggestionsPerType()
    let propSuggestions = getDefaultColumnSuggestionsPerType()

    const allowedSuggestionsNames = allowedSuggestions.map(
      (suggestion) => suggestion.name
    )

    staticSuggestions = staticSuggestions.filter(
      (suggestion) =>
        !allowedSuggestionsNames.includes(suggestion.name) &&
        !allocatedNames.includes(suggestion.name)
    )
    propSuggestions = propSuggestions.filter(
      (suggestion) =>
        !allowedSuggestionsNames.includes(suggestion.name) &&
        !allocatedNames.includes(suggestion.name)
    )

    if (columnName.trim() !== '') {
      staticSuggestions = staticSuggestions.filter((suggestion) =>
        suggestion.name
          .toLocaleLowerCase()
          .startsWith(columnName.toLocaleLowerCase())
      )
      propSuggestions = propSuggestions.filter((suggestion) =>
        suggestion.name
          .toLocaleLowerCase()
          .startsWith(columnName.toLocaleLowerCase())
      )
    }
    return {
      static: staticSuggestions,
      prop: propSuggestions,
    }
  }, [columnName, allowedSuggestions, allocatedNames, showDocPageForm])

  return (
    <Container ref={menuRef}>
      <MetadataContainer>
        {showCreationForm && (
          <MetadataContainerRow
            row={{
              type: 'content',
              content: (
                <Button
                  variant='secondary'
                  iconPath={mdiArrowLeft}
                  id='goback-suggestions-prop'
                  onClick={() => setShowCreationForm(false)}
                >
                  Back
                </Button>
              ),
            }}
          />
        )}
        <MetadataContainerRow
          row={{
            type: 'content',
            content: (
              <FormInput
                id='col-name-input'
                placeholder='Type to search or add..'
                ref={inputRef}
                value={columnName}
                onChange={(ev) => setColumnName(ev.target.value)}
                disabled={showCreationForm}
              />
            ),
          }}
        />
        {!showCreationForm && !isColumnNameInvalid && columnName.trim() !== '' && (
          <MetadataContainerRow
            row={{
              type: 'button',
              props: {
                label: `Create "${columnName}"`,
                id: `create-col`,
                onClick: () => setShowCreationForm(true),
              },
            }}
          />
        )}
        {isColumnNameInvalid && columnName.trim() !== '' && (
          <MetadataContainerRow
            row={{
              type: 'content',
              content: (
                <ColoredBlock variant='warning'>
                  A property named &apos;{columnName}&apos; already exists.
                </ColoredBlock>
              ),
            }}
          />
        )}

        {!showCreationForm && (
          <>
            {allowedSuggestions.length > 0 && (
              <>
                <MetadataContainerRow
                  row={{
                    type: 'header',
                    content: `From ${
                      !showDocPageForm ? 'Child Docs' : 'Parent Folder'
                    }`,
                  }}
                />
                {allowedSuggestions.map((propSuggestion) => (
                  <MetadataContainerRow
                    key={getPropsAddFormUniqueName(
                      propSuggestion.name,
                      propSuggestion.type,
                      propSuggestion.subType
                    )}
                    row={{
                      type: 'button',
                      props: {
                        label: propSuggestion.name,
                        iconPath: getIconPathOfPropType(
                          propSuggestion.subType || propSuggestion.type
                        ),
                        disabled: isColumnNameInvalid || sending != null,
                        spinning:
                          sending ===
                          getPropsAddFormUniqueName(
                            propSuggestion.name,
                            propSuggestion.type,
                            propSuggestion.subType
                          ),
                        id: `${propSuggestion.type}-${
                          propSuggestion.subType || ''
                        }-${propSuggestion.name}-col`,
                        onClick: () => {
                          if (
                            propSuggestion.type === 'creation_date' ||
                            propSuggestion.type === 'update_date' ||
                            propSuggestion.type === 'label'
                          ) {
                            if (addNewStaticCol == null) {
                              return
                            }

                            return addNewStaticCol(
                              propSuggestion.name,
                              propSuggestion.type
                            )
                          }

                          return addNewPropCol(
                            propSuggestion.name,
                            propSuggestion.type,
                            propSuggestion.subType
                          )
                        },
                      },
                    }}
                  />
                ))}
              </>
            )}

            {filteredDefaultSuggestions.static.length > 0 && (
              <>
                <MetadataContainerRow
                  row={{ type: 'header', content: 'Static Suggestions' }}
                />
                {filteredDefaultSuggestions.static.map((propSuggestion) => (
                  <MetadataContainerRow
                    key={`${propSuggestion.type}-${propSuggestion.name}`}
                    row={{
                      type: 'button',
                      props: {
                        label: propSuggestion.name,
                        iconPath: getIconPathOfPropType(propSuggestion.type),
                        disabled: isColumnNameInvalid || sending != null,
                        spinning:
                          sending ===
                          getPropsAddFormUniqueName(
                            propSuggestion.name,
                            propSuggestion.type
                          ),
                        id: `${propSuggestion.type}-${propSuggestion.name}-col`,
                        onClick:
                          showDocPageForm || addNewStaticCol == null
                            ? undefined
                            : () =>
                                addNewStaticCol(
                                  propSuggestion.name,
                                  propSuggestion.type
                                ),
                      },
                    }}
                  />
                ))}
              </>
            )}
            {filteredDefaultSuggestions.prop.length > 0 && (
              <>
                <MetadataContainerRow
                  row={{ type: 'header', content: 'Suggestions' }}
                />
                {filteredDefaultSuggestions.prop.map((propSuggestion) => (
                  <MetadataContainerRow
                    key={getPropsAddFormUniqueName(
                      propSuggestion.name,
                      propSuggestion.type,
                      propSuggestion.subType
                    )}
                    row={{
                      type: 'button',
                      props: {
                        label: propSuggestion.name,
                        iconPath: getIconPathOfPropType(
                          propSuggestion.subType || propSuggestion.type
                        ),
                        disabled: isColumnNameInvalid || sending != null,
                        spinning:
                          sending ===
                          getPropsAddFormUniqueName(
                            propSuggestion.name,
                            propSuggestion.type,
                            propSuggestion.subType
                          ),
                        id: `${propSuggestion.type}-${
                          propSuggestion.subType || ''
                        }-${propSuggestion.name}-col`,
                        onClick: () =>
                          addNewPropCol(
                            propSuggestion.name,
                            propSuggestion.type,
                            propSuggestion.subType
                          ),
                      },
                    }}
                  />
                ))}
              </>
            )}
          </>
        )}

        {showCreationForm && (
          <>
            {!showDocPageForm && addNewStaticCol != null && (
              <>
                <MetadataContainerRow
                  row={{ type: 'header', content: 'Static Type' }}
                />
                <MetadataContainerRow
                  row={{
                    type: 'button',
                    props: {
                      label: getLabelOfPropType('label'),
                      id: 'new-label-col',
                      iconPath: getIconPathOfPropType('label'),
                      disabled: isColumnNameInvalid || sending != null,
                      spinning:
                        sending ===
                        getPropsAddFormUniqueName(
                          getLabelOfPropType('label'),
                          'label'
                        ),
                      onClick: () => addNewStaticCol(columnName, 'label'),
                    },
                  }}
                />
                <MetadataContainerRow
                  row={{
                    type: 'button',
                    props: {
                      label: getLabelOfPropType('creation_date'),
                      id: 'new-creation-date-col',
                      iconPath: getIconPathOfPropType('creation_date'),
                      disabled: isColumnNameInvalid || sending != null,
                      spinning:
                        sending ===
                        getPropsAddFormUniqueName(
                          getLabelOfPropType('creation_date'),
                          'creation_date'
                        ),
                      onClick: () =>
                        addNewStaticCol(columnName, 'creation_date'),
                    },
                  }}
                />
                <MetadataContainerRow
                  row={{
                    type: 'button',
                    props: {
                      label: getLabelOfPropType('update_date'),
                      id: 'new-update-date-col',
                      iconPath: getIconPathOfPropType('update_date'),
                      disabled: isColumnNameInvalid || sending != null,
                      spinning:
                        sending ===
                        getPropsAddFormUniqueName(
                          getLabelOfPropType('update_date'),
                          'update_date'
                        ),
                      onClick: () => addNewStaticCol(columnName, 'update_date'),
                    },
                  }}
                />
              </>
            )}
            <MetadataContainerRow
              row={{ type: 'header', content: 'Property Type' }}
            />
            <MetadataContainerRow
              row={{
                type: 'button',
                props: {
                  label: getLabelOfPropType('date'),
                  iconPath: getIconPathOfPropType('date'),
                  disabled: isColumnNameInvalid || sending != null,
                  spinning: sending === 'date',
                  id: 'new-date-col',
                  onClick: () => addNewPropCol(columnName, 'date'),
                },
              }}
            />
            <MetadataContainerRow
              row={{
                type: 'button',
                props: {
                  label: getLabelOfPropType('user'),
                  id: 'new-person-col',
                  iconPath: getIconPathOfPropType('user'),
                  disabled: isColumnNameInvalid || sending != null,
                  spinning: sending === 'user',
                  onClick: () => addNewPropCol(columnName, 'user'),
                },
              }}
            />
            <MetadataContainerRow
              row={{
                type: 'button',
                props: {
                  label: getLabelOfPropType('timeperiod'),
                  id: 'new-time-col',
                  iconPath: getIconPathOfPropType('timeperiod'),
                  disabled: isColumnNameInvalid || sending != null,
                  spinning: sending === 'timeperiod',
                  onClick: () =>
                    addNewPropCol(columnName, 'json', 'timeperiod'),
                },
              }}
            />
            <MetadataContainerRow
              row={{
                type: 'button',
                props: {
                  id: 'new-status-col',
                  label: getLabelOfPropType('status'),
                  iconPath: getIconPathOfPropType('status'),
                  disabled: isColumnNameInvalid || sending != null,
                  spinning: sending === 'status',
                  onClick: () => addNewPropCol(columnName, 'status'),
                },
              }}
            />
            <MetadataContainerRow
              row={{
                type: 'button',
                props: {
                  id: 'new-number-col',
                  label: getLabelOfPropType('number'),
                  iconPath: getIconPathOfPropType('number'),
                  disabled: isColumnNameInvalid || sending != null,
                  spinning: sending === 'number',
                  onClick: () => addNewPropCol(columnName, 'number'),
                },
              }}
            />
          </>
        )}
      </MetadataContainer>
    </Container>
  )
}

const Container = styled.div`
  & .warning__text {
    color: ${({ theme }) => theme.colors.variants.warning.base};
    line-height: 18px;
    margin: 0;
  }

  #col-name-input {
    width: 100%;
  }
`

export default PropsAddForm

export function getPropsAddFormUniqueName(
  name: string,
  type: string,
  subType?: string
) {
  return `${name}-${type}-${subType || ''}`
}
