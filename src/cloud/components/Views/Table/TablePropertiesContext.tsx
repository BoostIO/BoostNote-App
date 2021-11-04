import { mdiTrashCanOutline } from '@mdi/js'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import Button from '../../../../design/components/atoms/Button'
import Flexbox from '../../../../design/components/atoms/Flexbox'
import MetadataContainer from '../../../../design/components/organisms/MetadataContainer'
import MetadataContainerRow from '../../../../design/components/organisms/MetadataContainer/molecules/MetadataContainerRow'
import styled from '../../../../design/lib/styled'
import {
  getIconPathOfProp,
  getInitialPropDataOfProp,
  getLabelOfProp,
  supportedPropertyNames,
} from '../../../lib/props'
import {
  getArrayFromRecord,
  sortByAttributeAsc,
} from '../../../lib/utils/array'
import { Column, makeTablePropColId } from '../../../lib/views/table'

interface TablePropertiesContextProps {
  columns: Record<string, Column>
  addColumn: (col: Column) => void
  removeColumn: (col: Column) => void
}

const TablePropertiesContext = ({
  columns: viewColumns,
  addColumn,
  removeColumn,
}: TablePropertiesContextProps) => {
  const menuRef = useRef<HTMLDivElement>(null)
  const [activeColumns, setActiveColumns] = useState(
    getArrayFromRecord(viewColumns)
  )

  const addCol = useCallback(
    (col: Column) => {
      setActiveColumns((prev) => {
        const newArray = prev.slice()
        if (newArray.findIndex((element) => element.name === col.name) === -1) {
          newArray.push(col)
          addColumn(col)
        }
        return newArray
      })
    },
    [addColumn]
  )

  const removeCol = useCallback(
    (col: Column) => {
      setActiveColumns((prev) => {
        return prev.slice().filter((elem) => elem.id !== col.id)
      })
      removeColumn(col)
    },
    [removeColumn]
  )

  const sortedActiveCols = useMemo(() => {
    return sortByAttributeAsc('name', activeColumns)
  }, [activeColumns])

  const unusedProperties = useMemo(() => {
    const activeCols = sortedActiveCols.map((col) => col.id.split(':')[1])
    return supportedPropertyNames.filter((value) => !activeCols.includes(value))
  }, [sortedActiveCols])

  return (
    <Container ref={menuRef}>
      <MetadataContainer>
        {sortedActiveCols.length > 0 && (
          <>
            <MetadataContainerRow
              row={{ type: 'header', content: 'Properties' }}
            />
            {sortedActiveCols.map((col, i) => (
              <MetadataContainerRow
                key={`prop-${col.name}-${i}`}
                row={{
                  type: 'content',
                  icon: getIconPathOfProp(col.id.split(':')[1]),
                  label: col.name,
                  content: (
                    <Flexbox justifyContent='flex-end'>
                      <Button
                        variant='icon'
                        iconPath={mdiTrashCanOutline}
                        onClick={() => removeCol(col)}
                        id={`prop-active-${col.id.split(':')[1]}-${i}`}
                        size='sm'
                      />
                    </Flexbox>
                  ),
                }}
              />
            ))}
          </>
        )}
        {unusedProperties.length > 0 && (
          <>
            <MetadataContainerRow
              row={{ type: 'header', content: 'Add Properties' }}
            />
            {unusedProperties.map((propName, i) => {
              const initialData = getInitialPropDataOfProp(propName)
              return (
                <MetadataContainerRow
                  key={`prop-${propName}-${i}`}
                  row={{
                    type: 'button',
                    props: {
                      id: `prop-${propName}-${i}`,
                      iconPath: getIconPathOfProp(propName),
                      label: getLabelOfProp(propName),
                      onClick: () =>
                        addCol({
                          id: makeTablePropColId(propName, initialData.type),
                          name: getLabelOfProp(propName),
                          type: initialData.type,
                        }),
                    },
                  }}
                />
              )
            })}
          </>
        )}
      </MetadataContainer>
    </Container>
  )
}

const Container = styled.div`
  .metadata__content {
    display: flex;
    flex: 1 1 auto;
    align-items: center;
    justify-content: flex-end;
  }
`

export default TablePropertiesContext
