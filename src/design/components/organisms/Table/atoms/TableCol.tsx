import React, { useMemo, CSSProperties } from 'react'
import styled from '../../../../lib/styled'
import { TableColProps } from '../tableInterfaces'
import TableSlider from './TableSlider'
import cc from 'classcat'

interface InternalTableColProps extends TableColProps {
  width?: number
}

const TableCol = ({
  children: name,
  width = 80,
  onClick,
  onContextMenu,
  onDragStart,
  onDragEnd,
  onDrop,
}: InternalTableColProps) => {
  const style = useMemo(() => {
    const style: CSSProperties = {}

    style.width = `${width}px`

    return style
  }, [width])

  return (
    <>
      <Container
        className={cc([
          'table__col',
          onClick != null && 'table__col--interactive',
        ])}
        style={style}
        onClick={onClick}
        onContextMenu={onContextMenu}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDrop={onDrop}
      >
        {name}
      </Container>
      <TableSlider />
    </>
  )
}

export default TableCol

const Container = styled.div`
  flex: 0 0 auto;
  padding: ${({ theme }) => theme.sizes.spaces.df}px
    ${({ theme }) => theme.sizes.spaces.sm}px;
  &:last-child {
    border-right: none;
  }
  min-width: 80px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  color: ${({ theme }) => theme.colors.text.subtle};

  &:hover {
    background-color: ${({ theme }) => theme.colors.background.secondary};
  }

  &.table__col--interactive {
    cursor: pointer;
  }
`
