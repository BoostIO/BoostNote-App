import { mdiTrashCanOutline } from '@mdi/js'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import Button from '../../../../design/components/atoms/Button'
import Flexbox from '../../../../design/components/atoms/Flexbox'
import MetadataContainer from '../../../../design/components/organisms/MetadataContainer'
import MetadataContainerRow from '../../../../design/components/organisms/MetadataContainer/molecules/MetadataContainerRow'
import styled from '../../../../design/lib/styled'
import { getIconPathOfPropType } from '../../../lib/props'
import {
  getArrayFromRecord,
  sortByAttributeAsc,
} from '../../../lib/utils/array'
import { Column } from '../../../lib/views/table'

interface TablePropertiesContextProps {
  columns: Record<string, Column>
  removeColumn: (col: Column) => void
}

const TablePropertiesContext = ({
  columns: viewColumns,
  removeColumn,
}: TablePropertiesContextProps) => {
  const menuRef = useRef<HTMLDivElement>(null)
  const [activeColumns, setActiveColumns] = useState(
    getArrayFromRecord(viewColumns)
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

  return (
    <Container ref={menuRef}>
      <MetadataContainer>
        <MetadataContainerRow row={{ type: 'header', content: 'Properties' }} />
        {sortedActiveCols.length > 0 ? (
          sortedActiveCols.map((col, i) => (
            <MetadataContainerRow
              key={`prop-${col.name}-${i}`}
              row={{
                type: 'content',
                icon: getIconPathOfPropType(col.id.split(':').pop() as any),
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
          ))
        ) : (
          <MetadataContainerRow
            row={{
              type: 'content',
              content: 'No columns left to manage.',
            }}
          />
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
