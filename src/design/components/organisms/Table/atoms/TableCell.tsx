import React, { CSSProperties, useMemo } from 'react'
import styled from '../../../../lib/styled'
import { TableCellProps } from '../tableInterfaces'
import TableSlider from './TableSlider'

interface InternalTableCellProps extends TableCellProps {
  width?: number
}

const TableCell = ({
  width = 80,
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
  padding: ${({ theme }) => theme.sizes.spaces.xsm}px
    ${({ theme }) => theme.sizes.spaces.sm}px;
  min-width: 80px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  &:last-child {
    border-right: none;
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.background.secondary};
  }
`
