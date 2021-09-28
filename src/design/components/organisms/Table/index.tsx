import React from 'react'
import styled from '../../../lib/styled'
import cc from 'classcat'

import { AppComponent } from '../../../lib/types'
import { generateId } from '../../../../lib/string'
import Scroller from '../../atoms/Scroller'

interface TableProps {
  bordered?: boolean
  type?: 'transparent' | 'striped'
  rows?: TableRowProps[]
  scroll: 'all' | 'after-first-col'
}

const Table: AppComponent<TableProps> = ({
  className,
  children,
  bordered = true,
  type = 'transparent',
  rows = [],
}) => {
  const tableId = generateId()
  return (
    <TableContainer
      id={tableId}
      className={cc([
        'table',
        `table--${type}`,
        bordered && 'table--bordered',
        className,
      ])}
    >
      <Scroller className='table__wrapper'>
        {rows.map((row, i) => (
          <TableRow {...row} key={`${tableId}-row-${i}`} />
        ))}
        {children}
      </Scroller>
    </TableContainer>
  )
}

interface TableRowProps {
  isHeaderRow?: boolean
}

export const TableRow: AppComponent<TableRowProps> = ({
  className,
  isHeaderRow,
  children,
}) => (
  <div
    className={cc([
      'table__row',
      isHeaderRow && 'table__row--header',
      className,
    ])}
  >
    {children}
  </div>
)

interface TableCellProps {
  isHeaderCell?: boolean
  onClick?: () => void
}

export const TableCell: AppComponent<TableCellProps> = ({
  className,
  children,
  isHeaderCell,
}) => (
  <div
    className={cc([
      'table__cell',
      isHeaderCell && 'table__cell--header',
      className,
    ])}
  >
    {children}
  </div>
)

export default Table

const TableContainer = styled.div`
  display: block;
  width: 100%;
  position: relative;

  * {
    box-sizing: border-box;
  }

  .table__row {
    display: flex;
    flex-flow: row nowrap;
    border-left: solid 1px ${({ theme }) => theme.colors.border.main};
    transition: 0.5s;

    &.table__row--header {
      border-top: solid 1px ${({ theme }) => theme.colors.border.main};
      border-left: solid 1px ${({ theme }) => theme.colors.border.main};

      .table__cell {
        font-size: ${({ theme }) => theme.sizes.fonts.df}px;
        text-transform: uppercase;
        font-weight: 600;
        color: ${({ theme }) => theme.colors.text.subtle};
      }
    }

    &.table__row--body:nth-child(odd) .table__cell {
      background: $row-bg;
    }
  }

  .table__cell {
    width: 100%;
    text-align: center;
    padding: 0.5em 0.5em;
    border-right: solid 1px ${({ theme }) => theme.colors.border.main};
    border-bottom: solid 1px ${({ theme }) => theme.colors.border.main};
  }

  .rowspan {
    display: flex;
    flex-flow: row wrap;
    align-items: flex-start;
    justify-content: center;
  }

  .table__cell__verticals {
    width: 100%;
    text-align: center;
    padding: 0.5em 0.5em;
    border-right: solid 1px ${({ theme }) => theme.colors.border.main};
    &:last-child {
    }
  }
`
