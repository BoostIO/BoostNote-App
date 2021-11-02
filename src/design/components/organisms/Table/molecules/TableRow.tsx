import React from 'react'
import styled from '../../../../lib/styled'
import TableCell from '../atoms/TableCell'
import { TableRowProps } from '../tableInterfaces'

interface InternalTableRowProps extends TableRowProps {
  widths?: (number | undefined)[]
  disabledAddColumn?: boolean
}

const TableRow = ({
  cells = [],
  widths = [],
  disabledAddColumn,
  children,
}: InternalTableRowProps) => {
  return (
    <Container>
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
  display: flex;
  border-bottom: solid 1px ${({ theme }) => theme.colors.border.main};
  &:last-child {
    border-bottom: none;
  }

  .table-row__spacer {
    min-width: 40px;
    flex: 1;
  }
`
