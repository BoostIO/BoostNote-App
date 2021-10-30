import { MouseEventHandler, DragEventHandler, ReactNode } from 'react'

export type TableRowVariant = 'default' | 'header'

export interface TableRowProps {
  id?: string
  variant?: TableRowVariant
  cells?: TableCellProps[]
  onDragStart?: DragEventHandler
  onDragEnd?: DragEventHandler
  onDrop?: DragEventHandler
  onContextMenu?: MouseEventHandler
}

export interface TableCellProps {
  onClick?: MouseEventHandler
  onContextMenu?: MouseEventHandler
  onDrop?: DragEventHandler
  children?: ReactNode | ReactNode[]
}

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
