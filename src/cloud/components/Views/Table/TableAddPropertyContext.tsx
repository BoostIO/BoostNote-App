import React, { useCallback, useMemo, useRef, useState } from 'react'
import { useEffectOnce } from 'react-use'
import ColoredBlock from '../../../../design/components/atoms/ColoredBlock'
import FormInput from '../../../../design/components/molecules/Form/atoms/FormInput'
import MetadataContainer from '../../../../design/components/organisms/MetadataContainer'
import MetadataContainerRow from '../../../../design/components/organisms/MetadataContainer/molecules/MetadataContainerRow'
import styled from '../../../../design/lib/styled'
import { PropType, StaticPropType } from '../../../interfaces/db/props'
import { useUpDownNavigationListener } from '../../../lib/keyboard'
import { getIconPathOfPropType } from '../../../lib/props'
import { Column, makeTablePropColId } from '../../../lib/views/table'

interface TableAddPropertyContextProps {
  columns: Record<string, Column>
  addColumn: (col: Column) => void
}

const TableAddPropertyContext = ({
  columns,
  addColumn,
}: TableAddPropertyContextProps) => {
  const menuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [columnName, setColumnName] = useState(
    `Column ${Object.keys(columns).length + 1}`
  )

  useEffectOnce(() => {
    if (inputRef.current != null) {
      inputRef.current.focus()
    }
  })

  const addCol = useCallback(
    (type: PropType, subType?: string) => {
      addColumn({
        id: makeTablePropColId(
          columnName,
          `${type}${subType != null ? `:${subType}` : ''}`
        ),
        name: columnName,
        type,
        subType,
      })
    },
    [addColumn, columnName]
  )

  const addStaticCol = useCallback(
    (prop: StaticPropType) => {
      addColumn({
        id: makeTablePropColId(columnName, prop),
        name: columnName,
        prop,
      })
    },
    [addColumn, columnName]
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

  useUpDownNavigationListener(menuRef, { overrideInput: true })

  return (
    <Container ref={menuRef}>
      <MetadataContainer>
        <MetadataContainerRow row={{ type: 'header', content: 'Name' }} />
        <MetadataContainerRow
          row={{
            type: 'content',
            content: (
              <FormInput
                id='col-name-input'
                ref={inputRef}
                value={columnName}
                onChange={(ev) => setColumnName(ev.target.value)}
              />
            ),
          }}
        />
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
        <MetadataContainerRow
          row={{ type: 'header', content: 'Custom Props' }}
        />
        <MetadataContainerRow
          row={{
            type: 'button',
            props: {
              label: 'Date',
              iconPath: getIconPathOfPropType('date'),
              disabled: isColumnNameInvalid,
              id: 'new-date-col',
              onClick: () => addCol('date'),
            },
          }}
        />
        <MetadataContainerRow
          row={{
            type: 'button',
            props: {
              label: 'Person',
              id: 'new-person-col',
              iconPath: getIconPathOfPropType('user'),
              disabled: isColumnNameInvalid,
              onClick: () => addCol('user'),
            },
          }}
        />
        <MetadataContainerRow
          row={{
            type: 'button',
            props: {
              label: 'Time',
              id: 'new-time-col',
              iconPath: getIconPathOfPropType('timeperiod'),
              disabled: isColumnNameInvalid,
              onClick: () => addCol('json', 'timeperiod'),
            },
          }}
        />
        <MetadataContainerRow
          row={{
            type: 'button',
            props: {
              label: 'Status',
              iconPath: getIconPathOfPropType('string'),
              disabled: true,
            },
          }}
        />
        <MetadataContainerRow row={{ type: 'header', content: 'Static' }} />
        <MetadataContainerRow
          row={{
            type: 'button',
            props: {
              label: 'Label',
              id: 'new-label-col',
              iconPath: getIconPathOfPropType('label'),
              disabled: isColumnNameInvalid,
              onClick: () => addStaticCol('label'),
            },
          }}
        />
        <MetadataContainerRow
          row={{
            type: 'button',
            props: {
              label: 'Creation Date',
              id: 'new-creation-date-col',
              iconPath: getIconPathOfPropType('creation_date'),
              disabled: isColumnNameInvalid,
              onClick: () => addStaticCol('creation_date'),
            },
          }}
        />
        <MetadataContainerRow
          row={{
            type: 'button',
            props: {
              label: 'Update Date',
              id: 'new-update-date-col',
              iconPath: getIconPathOfPropType('update_date'),
              disabled: isColumnNameInvalid,
              onClick: () => addStaticCol('update_date'),
            },
          }}
        />
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
