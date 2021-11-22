import { mdiArrowLeft } from '@mdi/js'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useEffectOnce } from 'react-use'
import Button from '../../../../design/components/atoms/Button'
import ColoredBlock from '../../../../design/components/atoms/ColoredBlock'
import FormInput from '../../../../design/components/molecules/Form/atoms/FormInput'
import MetadataContainer from '../../../../design/components/organisms/MetadataContainer'
import MetadataContainerRow from '../../../../design/components/organisms/MetadataContainer/molecules/MetadataContainerRow'
import { focusFirstChildFromElement } from '../../../../design/lib/dom'
import { BulkApiActionRes } from '../../../../design/lib/hooks/useBulkApi'
import styled from '../../../../design/lib/styled'
import {
  ListPropertySuggestionsRequestBody,
  ListPropertySuggestionsResponseBody,
} from '../../../api/teams/props'
import {
  PropSubType,
  PropType,
  StaticPropType,
} from '../../../interfaces/db/props'
import { SerializedView } from '../../../interfaces/db/view'
import { useCloudApi } from '../../../lib/hooks/useCloudApi'
import { useUpDownNavigationListener } from '../../../lib/keyboard'
import {
  getDefaultColumnSuggestionsPerType,
  getDefaultStaticSuggestionsPerType,
  getIconPathOfPropType,
  getLabelOfPropType,
} from '../../../lib/props'
import {
  Column,
  getInsertedColumnOrder,
  isPropCol,
  makeTablePropColId,
} from '../../../lib/views/table'

interface TableAddPropertyContextProps {
  view: SerializedView
  teamId: string
  columns: Record<string, Column>
  addColumn: (col: Column) => Promise<BulkApiActionRes> | undefined
  close: () => void
}

interface PropertySuggestions {
  name: string
  type: PropType | StaticPropType
  subType?: PropSubType
}

const TableAddPropertyContext = ({
  view,
  teamId,
  columns,
  addColumn,
  close,
}: TableAddPropertyContextProps) => {
  const menuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [sending, setSending] = useState<string>()
  const [columnName, setColumnName] = useState('')
  const [suggestions, setSuggestions] = useState<PropertySuggestions[]>([])
  const { fetchPropertySuggestionsApi } = useCloudApi()
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

  const fetchSuggestions = useCallback(async () => {
    const body: ListPropertySuggestionsRequestBody = { team: teamId }
    if (view.folderId != null) {
      body.folder = view.folderId
    }

    if (view.workspaceId != null) {
      body.workspace = view.workspaceId
    }
    const res = await fetchPropertySuggestionsApi(body)
    if (!res.err) {
      setSuggestions((res.data as ListPropertySuggestionsResponseBody).data)
    } else {
      setSuggestions([])
    }
  }, [teamId, fetchPropertySuggestionsApi, view.folderId, view.workspaceId])

  const addCol = useCallback(
    async (col: Column) => {
      if (sending != null) {
        return
      }

      setSending(isPropCol(col) ? col.subType || col.type : col.prop)
      const res = await addColumn(col)
      setSending(undefined)
      if (res != null && !res.err) {
        close()
      }
    },
    [addColumn, close, sending]
  )

  const addPropCol = useCallback(
    (type: PropType, subType?: PropSubType) => {
      addCol({
        id: makeTablePropColId(columnName, type, subType),
        name: columnName,
        type,
        subType,
        order: getInsertedColumnOrder(columns),
      })
    },
    [addCol, columnName, columns]
  )

  const addNewPropCol = useCallback(
    (name: string, type: PropType, subType?: PropSubType) => {
      addCol({
        id: makeTablePropColId(name, type, subType),
        name: name,
        type,
        subType,
        order: getInsertedColumnOrder(columns),
      })
    },
    [addCol, columns]
  )

  const addNewStaticCol = useCallback(
    (name: string, prop: StaticPropType) => {
      addCol({
        id: makeTablePropColId(name, prop),
        name: name,
        prop,
        order: getInsertedColumnOrder(columns),
      })
    },
    [addCol, columns]
  )

  const addStaticCol = useCallback(
    (prop: StaticPropType) => {
      addCol({
        id: makeTablePropColId(columnName, prop),
        name: columnName,
        prop,
        order: getInsertedColumnOrder(columns),
      })
    },
    [addCol, columnName, columns]
  )

  const isColumnNameInvalid = useMemo(() => {
    const lowercaseValue = columnName.toLocaleLowerCase().trim()

    if (lowercaseValue === '') {
      return false
    }

    return Object.values(columns).reduce((acc, value) => {
      if (value.name.toLocaleLowerCase() === lowercaseValue) {
        acc = true
      }
      return acc
    }, false)
  }, [columns, columnName])

  const allowedSuggestions = useMemo(() => {
    const allocatedNames = Object.values(columns).map((col) => col.name)
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
  }, [columns, suggestions, columnName])

  const filteredDefaultSuggestions = useMemo(() => {
    let staticSuggestions = getDefaultStaticSuggestionsPerType()
    let propSuggestions = getDefaultColumnSuggestionsPerType()

    const allowedSuggestionsNames = allowedSuggestions.map(
      (suggestion) => suggestion.name
    )

    if (columnName.trim() !== '') {
      staticSuggestions = staticSuggestions.filter((suggestion) => {
        return (
          suggestion.name
            .toLocaleLowerCase()
            .startsWith(columnName.toLocaleLowerCase()) &&
          !allowedSuggestionsNames.includes(suggestion.name)
        )
      })
      propSuggestions = propSuggestions.filter((suggestion) => {
        return (
          suggestion.name
            .toLocaleLowerCase()
            .startsWith(columnName.toLocaleLowerCase()) &&
          !allowedSuggestionsNames.includes(suggestion.name)
        )
      })
    }
    return {
      static: staticSuggestions,
      prop: propSuggestions,
    }
  }, [columnName, allowedSuggestions])

  useUpDownNavigationListener(menuRef, { overrideInput: true })

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
        <MetadataContainerRow row={{ type: 'header', content: 'Name' }} />
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
        {isColumnNameInvalid && (
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
                  row={{ type: 'header', content: 'From Child Docs' }}
                />
                {allowedSuggestions.map((propSuggestion) => (
                  <MetadataContainerRow
                    key={`${propSuggestion.type}-${
                      propSuggestion.subType || ''
                    }-${propSuggestion.name}`}
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
                          `${propSuggestion.type}-${
                            propSuggestion.subType || ''
                          }-${propSuggestion.name}`,
                        id: `${propSuggestion.type}-${
                          propSuggestion.subType || ''
                        }-${propSuggestion.name}-col`,
                        onClick: () => {
                          if (
                            propSuggestion.type === 'creation_date' ||
                            propSuggestion.type === 'update_date' ||
                            propSuggestion.type === 'label'
                          ) {
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
                          `${propSuggestion.type}-${propSuggestion.name}`,
                        id: `${propSuggestion.type}-${propSuggestion.name}-col`,
                        onClick: () =>
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
                    key={`${propSuggestion.type}-${
                      propSuggestion.subType || ''
                    }-${propSuggestion.name}`}
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
                          `${propSuggestion.type}-${
                            propSuggestion.subType || ''
                          }-${propSuggestion.name}`,
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
            <MetadataContainerRow row={{ type: 'header', content: 'Static' }} />
            <MetadataContainerRow
              row={{
                type: 'button',
                props: {
                  label: getLabelOfPropType('label'),
                  id: 'new-label-col',
                  iconPath: getIconPathOfPropType('label'),
                  disabled: isColumnNameInvalid || sending != null,
                  spinning: sending === 'label',
                  onClick: () => addStaticCol('label'),
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
                  spinning: sending === 'creation_date',
                  onClick: () => addStaticCol('creation_date'),
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
                  spinning: sending === 'update_date',
                  onClick: () => addStaticCol('update_date'),
                },
              }}
            />
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
                  onClick: () => addPropCol('date'),
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
                  onClick: () => addPropCol('user'),
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
                  onClick: () => addPropCol('json', 'timeperiod'),
                },
              }}
            />
            <MetadataContainerRow
              row={{
                type: 'button',
                props: {
                  label: getLabelOfPropType('status'),
                  iconPath: getIconPathOfPropType('status'),
                  disabled: isColumnNameInvalid || sending != null,
                  spinning: sending === 'status',
                  onClick: () => addPropCol('status'),
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
  #col-name-input {
    width: 100%;
  }
`

export default TableAddPropertyContext
