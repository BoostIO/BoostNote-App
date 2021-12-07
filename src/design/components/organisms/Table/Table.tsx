import React, { useMemo, MouseEventHandler, useState } from 'react'
import styled from '../../../lib/styled'
import cc from 'classcat'

import { AppComponent } from '../../../lib/types'
import Scroller from '../../atoms/Scroller'
import TableRow from './molecules/TableRow'
import TableCol from './atoms/TableCol'
import Icon from '../../atoms/Icon'
import { mdiPlus } from '@mdi/js'
import { TableColProps, TableRowProps } from './tableInterfaces'
import shortid from 'shortid'
import Checkbox from '../../molecules/Form/atoms/FormCheckbox'

interface TableProps {
  cols?: TableColProps[]
  rows?: TableRowProps[]
  disabledAddColumn?: boolean
  disabledAddRow?: boolean
  allRowsAreSelected?: boolean
  showCheckboxes?: boolean
  onAddColButtonClick?: MouseEventHandler<HTMLButtonElement>
  onAddRowButtonClick?: MouseEventHandler<HTMLButtonElement>
  selectAllRows?: (val: boolean) => void
  stickyFirstCol?: boolean
}

const Table: AppComponent<TableProps> = ({
  className,
  cols = [],
  rows = [],
  selectAllRows,
  showCheckboxes,
  allRowsAreSelected,
  disabledAddColumn = false,
  onAddColButtonClick,
  disabledAddRow = false,
  onAddRowButtonClick,
  stickyFirstCol = true,
}) => {
  const [tableId] = useState(shortid.generate())
  const columnWidths = useMemo(() => {
    return cols.map((col) => {
      return col.width
    })
  }, [cols])

  return (
    <TableContainer
      className={cc([
        'table',
        className,
        stickyFirstCol && 'table--sticky-col',
        showCheckboxes && 'table--with-checkbox',
      ])}
    >
      <Scroller className='table__wrapper'>
        <div>
          <div className='table__header'>
            {showCheckboxes && selectAllRows != null && (
              <div className='table-row__checkbox__wrapper'>
                <Checkbox
                  className={cc([
                    'table-row__checkbox',
                    allRowsAreSelected && 'table-row__checkbox--checked',
                  ])}
                  checked={allRowsAreSelected}
                  toggle={() => selectAllRows(!allRowsAreSelected)}
                />
              </div>
            )}
            {cols.map((col, i) => (
              <TableCol {...col} key={`${tableId}-head-${i}`} />
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
        </div>
        {rows.map((row, i) => (
          <div
            className='table-row__wrapper'
            key={row.id != null ? row.id : `row-${i}`}
          >
            <TableRow
              {...row}
              widths={columnWidths}
              disabledAddColumn={disabledAddColumn}
              showCheckbox={showCheckboxes}
            />
          </div>
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
  overflow-x: auto;
  border-color: ${({ theme }) => theme.colors.border.main};
  .table__header {
    display: inline-flex;
    border-bottom: solid 1px ${({ theme }) => theme.colors.border.main};
  }

  .table-row,
  .table__header {
    min-width: 100%;
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

  .table-row__checkbox__wrapper {
    display: flex;
    align-items: center;
  }
  .table-row:hover .table-row__checkbox,
  .table__header:hover .table-row__checkbox {
    opacity: 1;
  }

  .table-row__checkbox {
    opacity: 0;
    margin-left: ${({ theme }) => theme.sizes.spaces.df}px;
    margin-right: ${({ theme }) => theme.sizes.spaces.df}px;

    &.table-row__checkbox--checked {
      opacity: 1;
    }
  }

  &.table--sticky-col {
    .table__header > div:first-child {
      z-index: 10;
      position: sticky;
      left: 0;
      background-color: ${({ theme }) => theme.colors.background.primary};
    }

    .table__header > div:nth-child(2) {
      z-index: 10;
      position: sticky;
      left: 300px;
      background-color: ${({ theme }) => theme.colors.background.primary};
    }

    .table-row > div:first-child {
      z-index: 10;
      position: sticky;
      left: 0;
      background-color: ${({ theme }) => theme.colors.background.primary};
    }

    .table-row > div:nth-child(2) {
      z-index: 10;
      position: sticky;
      left: 300px;
      background-color: ${({ theme }) => theme.colors.background.primary};
    }

    &.table--with-checkbox {
      .table-row > div:nth-child(2) {
        position: sticky;
        left: 42px;
      }

      .table-row > div:nth-child(3) {
        z-index: 10;
        position: sticky;
        background-color: ${({ theme }) => theme.colors.background.primary};
      }

      .table__header > div:nth-child(2) {
        position: sticky;
        left: 42px;
      }

      .table__header > div:nth-child(3) {
        z-index: 10;
        position: sticky;
        background-color: ${({ theme }) => theme.colors.background.primary};
      }
    }
  }

  .table-row__wrapper:last-child > .table-row {
    border-bottom: none;
  }
`
