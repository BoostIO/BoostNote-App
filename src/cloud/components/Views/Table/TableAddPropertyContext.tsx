import React, { useCallback, useMemo, useRef, useState } from 'react'
import { useEffectOnce } from 'react-use'
import ColoredBlock from '../../../../design/components/atoms/ColoredBlock'
import FormInput from '../../../../design/components/molecules/Form/atoms/FormInput'
import MetadataContainer from '../../../../design/components/organisms/MetadataContainer'
import MetadataContainerRow from '../../../../design/components/organisms/MetadataContainer/molecules/MetadataContainerRow'
import { BulkApiActionRes } from '../../../../design/lib/hooks/useBulkApi'
import styled from '../../../../design/lib/styled'
import { PropType, StaticPropType } from '../../../interfaces/db/props'
import { useUpDownNavigationListener } from '../../../lib/keyboard'
import { getIconPathOfPropType, getLabelOfPropType } from '../../../lib/props'
import {
  Column,
  getInsertedColumnOrder,
  isPropCol,
  makeTablePropColId,
} from '../../../lib/views/table'

interface TableAddPropertyContextProps {
  columns: Record<string, Column>
  addColumn: (col: Column) => Promise<BulkApiActionRes> | undefined
  close: () => void
}

const TableAddPropertyContext = ({
  columns,
  addColumn,
  close,
}: TableAddPropertyContextProps) => {
  const menuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [sending, setSending] = useState<string>()
  const [columnName, setColumnName] = useState(
    `Column ${Object.keys(columns).length + 1}`
  )

  useEffectOnce(() => {
    if (inputRef.current != null) {
      inputRef.current.focus()
      inputRef.current.setSelectionRange(0, columnName.length)
    }
  })

  const addCol = useCallback(
    async (col: Column) => {
      if (sending != null) {
        return
      }

      setSending(isPropCol(col) ? col.subType || col.type : col.prop)
      const res = await addColumn(col)
      if (res != null && !res.err) {
        close()
      }
      setSending(undefined)
    },
    [addColumn, close, sending]
  )

  const addPropCol = useCallback(
    (type: PropType, subType?: string) => {
      addCol({
        id: makeTablePropColId(
          columnName,
          `${type}${subType != null ? `:${subType}` : ''}`
        ),
        name: columnName,
        type,
        subType,
        order: getInsertedColumnOrder(columns),
      })
    },
    [addCol, columnName, columns]
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
              label: getLabelOfPropType('string'),
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
