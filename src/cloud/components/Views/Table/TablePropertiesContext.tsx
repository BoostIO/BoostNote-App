import { mdiEyeOffOutline } from '@mdi/js'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { LoadingButton } from '../../../../design/components/atoms/Button'
import Flexbox from '../../../../design/components/atoms/Flexbox'
import MetadataContainer from '../../../../design/components/organisms/MetadataContainer'
import MetadataContainerRow from '../../../../design/components/organisms/MetadataContainer/molecules/MetadataContainerRow'
import styled from '../../../../design/lib/styled'
import { TableViewActionsRef } from '../../../lib/hooks/views/tableView'
import { getIconPathOfPropType } from '../../../lib/props'
import {
  getArrayFromRecord,
  sortByAttributeAsc,
} from '../../../lib/utils/array'
import { Column } from '../../../lib/views/table'

interface TablePropertiesContextProps {
  columns: Record<string, Column>
  tableActionsRef: TableViewActionsRef
}

const TablePropertiesContext = ({
  columns: viewColumns,
  tableActionsRef,
}: TablePropertiesContextProps) => {
  const menuRef = useRef<HTMLDivElement>(null)
  const [activeColumns, setActiveColumns] = useState(
    getArrayFromRecord(viewColumns)
  )
  const [sending, setSending] = useState<string>()

  const removeCol = useCallback(
    async (col: Column) => {
      if (sending != null) {
        return
      }

      setSending(`${col.id}-delete`)
      const res = await tableActionsRef.current.removeColumn(col)
      if (res != null && !res.err) {
        setActiveColumns((prev) => {
          return prev.slice().filter((elem) => elem.id !== col.id)
        })
      }
      setSending(undefined)
    },
    [tableActionsRef, sending]
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
                    <LoadingButton
                      variant='icon'
                      disabled={sending != null}
                      spinning={sending === `${col.id}-delete`}
                      iconPath={mdiEyeOffOutline}
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
          <div className='metadata__item'>No columns left to manage.</div>
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
