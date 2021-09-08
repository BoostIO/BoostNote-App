import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Switch from '../../../../../design/components/atoms/Switch'
import MetadataContainer from '../../../../../design/components/organisms/MetadataContainer'
import MetadataContainerBreak from '../../../../../design/components/organisms/MetadataContainer/atoms/MetadataContainerBreak'
import MetadataContainerRow from '../../../../../design/components/organisms/MetadataContainer/molecules/MetadataContainerRow'
import styled from '../../../../../design/lib/styled'
import { PropType } from '../../../../lib/blocks/props'
import {
  Column,
  getDataPropColProp,
  isDataPropCol,
  makeDataPropCol,
  makePropCol,
} from '../../../../lib/blocks/table'
import { capitalize } from '../../../../lib/utils/string'
import DataTypeMenu from '../../props/DataTypeMenu'

interface TableSettingsProps {
  columns: Column[]
  addColumn: (col: Column, shouldClose?: boolean) => void
  deleteColumn: (col: Column, shouldClose?: boolean) => void
  subscribe: (observer: (cols: Column[]) => void) => () => void
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
const TableSettings = ({
  columns,
  addColumn,
  deleteColumn,
  subscribe,
}: TableSettingsProps) => {
  const [internal, setInternal] = useState(columns)

  useEffect(() => {
    return subscribe(setInternal)
  }, [subscribe])

  const activeProps = useMemo(() => {
    return new Map(
      internal
        .filter(isDataPropCol)
        .map((prop) => [getDataPropColProp(prop), prop])
    )
  }, [internal])

  const toggleProp = useCallback(
    (prop: string) => {
      const propKey = activeProps.get(prop)
      if (propKey != null) {
        deleteColumn(propKey)
      } else {
        addColumn(makeDataPropCol(capitalize(prop), prop))
      }
    },
    [addColumn, deleteColumn, activeProps]
  )

  const insertColumn = useCallback(
    (type: PropType) => {
      addColumn(makePropCol(capitalize(type), type), true)
    },
    [addColumn]
  )

  return (
    <MetadataContainer>
      <Container>
        <MetadataContainerRow row={{ type: 'header', content: 'GITHUB' }} />
        {GITHUB_PROPS.map((prop) => {
          return (
            <MetadataContainerRow
              key={prop}
              className='table__settings__toggle'
              row={{
                type: 'content',
                label: prop,
                content: (
                  <Switch
                    checked={activeProps.has(prop)}
                    onChange={() => toggleProp(prop)}
                    id={`github-prop-${prop}`}
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
    </MetadataContainer>
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
