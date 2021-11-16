import React, { CSSProperties, useMemo } from 'react'
import styled from '../../../../lib/styled'
import { TableCellProps } from '../tableInterfaces'
import TableSlider from './TableSlider'
import cc from 'classcat'

interface InternalTableCellProps extends TableCellProps {
  width?: number
}

const TableCell = ({
  width = 80,
  addPadding,
  className,
  onClick,
  onContextMenu,
  onDrop,
  children,
}: InternalTableCellProps) => {
  const style = useMemo(() => {
    const style: CSSProperties = {}

    style.width = `${width}px`

    return style
  }, [width])

  return (
    <>
      <Container
        className={cc([
          'table__row__cell',
          onClick != null && 'table__row__cell--interactive',
          !addPadding && 'table__row__cell--no-padding',
          className,
        ])}
        style={style}
        onClick={onClick}
        onContextMenu={onContextMenu}
        onDrop={onDrop}
      >
        {children}
      </Container>
      <TableSlider />
    </>
  )
}

export default TableCell

const Container = styled.div`
  min-width: 80px;
  white-space: nowrap;
  text-overflow: ellipsis;

  &:last-child {
    border-right: none;
  }

  &.not(.table__row__cell--no-padding) {
    padding: ${({ theme }) => theme.sizes.spaces.xsm}px
      ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  &.table__row__cell--interactive:hover {
    background-color: ${({ theme }) => theme.colors.background.secondary};
  }
`
