import React, { MouseEventHandler, DragEventHandler } from 'react'

export type TableRowVariant = 'default' | 'header'

export type TableRowProps = React.PropsWithChildren<{
  id?: string
  variant?: TableRowVariant
  cells?: TableCellProps[]
  onDragStart?: DragEventHandler
  onDragEnd?: DragEventHandler
  onDrop?: DragEventHandler
  onContextMenu?: MouseEventHandler
}>

export type TableCellProps = React.PropsWithChildren<{
  onClick?: MouseEventHandler
  onContextMenu?: MouseEventHandler
  onDrop?: DragEventHandler
}>

export interface TableColProps {
  id?: string
  name: string
  width?: number
  onClick?: MouseEventHandler
  onContextMenu?: MouseEventHandler
  onDragStart?: DragEventHandler
  onDragEnd?: DragEventHandler
  onDrop?: DragEventHandler
}
