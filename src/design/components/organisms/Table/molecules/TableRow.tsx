import React from 'react'
import styled from '../../../../lib/styled'
import TableCell from '../atoms/TableCell'
import { TableRowProps } from '../tableInterfaces'
import cc from 'classcat'
import Checkbox from '../../../molecules/Form/atoms/FormCheckbox'

interface InternalTableRowProps extends TableRowProps {
  widths?: (number | undefined)[]
  disabledAddColumn?: boolean
}

const TableRow = ({
  cells = [],
  widths = [],
  checked,
  onCheckboxToggle,
  showCheckbox,
  disabledAddColumn,
  children,
}: InternalTableRowProps) => {
  return (
    <Container div className='table-row'>
      <div className='table-row__checkbox__wrapper'>
        {showCheckbox && onCheckboxToggle != null && (
          <Checkbox
            className={cc([
              'table-row__checkbox',
              checked && 'table-row__checkbox--checked',
            ])}
            checked={checked}
            toggle={() => onCheckboxToggle(!checked)}
          />
        )}
      </div>
      {cells.map((cell, i) => (
        <TableCell {...cell} width={widths[i]} key={`table-cell-${i}`} />
      ))}
      {children}
      {!disabledAddColumn && <div className='table-row__spacer'></div>}
    </Container>
  )
}

export default TableRow

const Container = styled.div`
  display: inline-flex;
  border-bottom: solid 1px ${({ theme }) => theme.colors.border.main};
  .table-row__spacer {
    min-width: 40px;
    flex: 1;
  }
`
