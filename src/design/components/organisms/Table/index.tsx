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

export const TableRow = () => <div className='table__row' />

interface TableCellProps {
  isHeaderCell?: boolean
  onClick?: () => void
}

export const TableCell = (_props: TableCellProps) => (
  <div className='table__cell' />
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
    flex-flow: row wrap;
    border-left: solid 1px ${({ theme }) => theme.colors.border.main};
    transition: 0.5s;

    &.table__row--header {
      border-top: solid 1px ${({ theme }) => theme.colors.border.main};
      border-left: solid 1px ${({ theme }) => theme.colors.border.main};

      .table__cell {
        background: $table-header;
        color: white;
        border-color: $table-header-border;
      }
    }

    &.table__row--body:nth-child(odd) .table__cell {
      background: $row-bg;
    }
    &:hover {
      background: #f5f5f5;
      transition: 500ms;
    }
  }

  .table__cell {
    width: calc(100% / 4);
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

  .column {
    display: flex;
    flex-flow: column wrap;
    width: 75%;
    padding: 0;
    .table__cell {
      display: flex;
      flex-flow: row wrap;
      width: 100%;
      padding: 0;
      border: 0;
      border-bottom: solid 1px ${({ theme }) => theme.colors.border.main};
      &:hover {
        background: #f5f5f5;
        transition: 500ms;
      }
    }
  }

  .table__cell__verticals {
    width: calc(100% / 3);
    text-align: center;
    padding: 0.5em 0.5em;
    border-right: solid 1px ${({ theme }) => theme.colors.border.main};
    &:last-child {
    }
  }

  @media all and (max-width: 767px) {
    .table__cell {
      width: calc(100% / 3);

      &.first {
        width: 100%;
      }
    }

    .column {
      width: 100%;
    }
  }

  @media all and (max-width: 430px) {
    .table__row {
      .table__cell {
        border-bottom: 0;
      }
      .table__cell:last-of-type {
        border-bottom: solid 1px ${({ theme }) => theme.colors.border.main};
      }
    }

    .header {
      .table__cell {
        border-bottom: solid 1px;
      }
    }

    .table__cell {
      width: 100%;

      &.first {
        width: 100%;
        border-bottom: solid 1px ${({ theme }) => theme.colors.border.main};
      }
    }

    .column {
      width: 100%;
      .table__cell {
        border-bottom: solid 1px ${({ theme }) => theme.colors.border.main};
      }
    }

    .table__cell__verticals {
      width: 100%;
    }
  }
`
