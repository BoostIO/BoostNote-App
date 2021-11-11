import React, { useMemo, MouseEventHandler } from 'react'
import styled from '../../../lib/styled'
import cc from 'classcat'

import { AppComponent } from '../../../lib/types'
import Scroller from '../../atoms/Scroller'
import TableRow from './molecules/TableRow'
import TableCol from './atoms/TableCol'
import Icon from '../../atoms/Icon'
import { mdiPlus } from '@mdi/js'
import { TableColProps, TableRowProps } from './tableInterfaces'

interface TableProps {
  cols?: TableColProps[]
  rows?: TableRowProps[]
  disabledAddColumn?: boolean
  disabledAddRow?: boolean
  onAddColButtonClick?: MouseEventHandler<HTMLButtonElement>
  onAddRowButtonClick?: MouseEventHandler<HTMLButtonElement>
}

const Table: AppComponent<TableProps> = ({
  className,
  cols = [],
  rows = [],
  disabledAddColumn = false,
  onAddColButtonClick,
  disabledAddRow = false,
  onAddRowButtonClick,
}) => {
  const columnWidths = useMemo(() => {
    return cols.map((col) => {
      return col.width
    })
  }, [cols])

  return (
    <TableContainer className={cc(['table', className])}>
      <Scroller className='table__wrapper'>
        <div className='table__header'>
          {cols.map((col) => (
            <TableCol {...col} key={`head-${col.children}`} />
          ))}
          {!disabledAddColumn && (
            <button
              className='table__header__addColButton'
              onClick={onAddColButtonClick}
            >
              <Icon path={mdiPlus} size={16} />
            </button>
          )}
        </div>
        {rows.map((row, i) => (
          <TableRow
            key={row.id != null ? row.id : `row-${i}`}
            {...row}
            widths={columnWidths}
            disabledAddColumn={disabledAddColumn}
          />
        ))}

        {!disabledAddRow && (
          <button className='table__addRowButton' onClick={onAddRowButtonClick}>
            <Icon path={mdiPlus} size={16} />
          </button>
        )}
      </Scroller>
    </TableContainer>
  )
}

export default Table

const TableContainer = styled.div`
  border-style: solid;
  border-width: 1px 0;
  border-color: ${({ theme }) => theme.colors.border.main};
  .table__header {
    display: flex;
    border-bottom: solid 1px ${({ theme }) => theme.colors.border.main};
  }

  .table__header__addColButton {
    background-color: transparent;
    color: ${({ theme }) => theme.colors.text.primary};
    min-width: 40px;
    flex: 1;
    text-align: left;

    &:hover {
      background-color: ${({ theme }) => theme.colors.background.secondary};
    }
  }

  .table__addRowButton {
    background-color: transparent;
    color: ${({ theme }) => theme.colors.text.primary};
    width: 100%;
    text-align: left;
    padding: ${({ theme }) => theme.sizes.spaces.xsm}px;

    &:hover {
      background-color: ${({ theme }) => theme.colors.background.secondary};
    }
  }
`
