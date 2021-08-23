import { flip } from 'ramda'
import React, { useCallback, useMemo, useState } from 'react'
import Switch from '../../../../../design/components/atoms/Switch'
import MetadataContainerBreak from '../../../../../design/components/organisms/MetadataContainer/atoms/MetadataContainerBreak'
import MetadataContainerRow from '../../../../../design/components/organisms/MetadataContainer/molecules/MetadataContainerRow'
import styled from '../../../../../design/lib/styled'
import {
  addColumn,
  DataType,
  deleteColumn,
  Table,
} from '../../../../lib/blocks/table'
import { capitalize } from '../../../../lib/utils/string'
import DataTypeMenu from './DataTypeMenu'

interface TableSettingsProps {
  table: Table
  updateTable: (table: Table, shouldClose?: boolean) => void
}

const GITHUB_PROPS = [
  'owner',
  'org',
  'repo',
  'issue_number',
  'body',
  'creator',
  'assignees',
  'state',
  'milestone',
  'labels',
  'pull_request',
] as const
const TableSettings = ({ table, updateTable }: TableSettingsProps) => {
  const [internal, setInternal] = useState(table)

  const activeProps = useMemo(() => {
    return new Set(
      internal.columns
        .filter((col) => col.data_type === 'prop')
        .map((col) => col.default)
    )
  }, [internal])

  const setTable = useCallback(
    (table: Table, shouldClose = false) => {
      setInternal(table)
      updateTable(table, shouldClose)
    },
    [updateTable]
  )

  const toggleProp = useCallback(
    (prop: string) => {
      const existingCols = internal.columns.filter(
        (col) => col.data_type === 'prop' && col.default === prop
      )
      if (existingCols.length > 0) {
        setTable(existingCols.reduce(flip(deleteColumn), internal))
      } else {
        setTable(
          addColumn(
            { data_type: 'prop', name: capitalize(prop), default: prop },
            internal
          )
        )
      }
    },
    [internal]
  )

  const insertColumn = useCallback(
    (type: DataType) => {
      setTable(
        addColumn({ data_type: type, name: capitalize(type) }, internal),
        true
      )
    },
    [internal]
  )

  return (
    <Container>
      <MetadataContainerRow row={{ type: 'header', content: 'GITHUB' }} />
      {GITHUB_PROPS.map((prop) => {
        return (
          <MetadataContainerRow
            className='table__settings__toggle'
            row={{
              type: 'content',
              label: prop,
              content: (
                <Switch
                  checked={activeProps.has(prop)}
                  onChange={() => toggleProp(prop)}
                />
              ),
            }}
          />
        )
      })}
      <MetadataContainerBreak />
      <MetadataContainerRow row={{ type: 'header', content: 'PROPERTIES' }} />
      <DataTypeMenu onSelect={insertColumn} />
    </Container>
  )
}

export default TableSettings

const Container = styled.div`
  & .table__settings__toggle {
    & .metadata__content {
      display: flex;
      justify-content: flex-end;
    }
  }
`
