import React, { MouseEventHandler, DragEventHandler } from 'react'

export type TableRowVariant = 'default' | 'header'

export type TableRowProps = React.PropsWithChildren<{
  id?: string
  variant?: TableRowVariant
  cells?: TableCellProps[]
  checked?: boolean
  showCheckbox?: boolean
  onCheckboxToggle?: (val: boolean) => void
  onDragStart?: DragEventHandler
  onDragEnd?: DragEventHandler
  onDrop?: DragEventHandler
  onContextMenu?: MouseEventHandler
}>

export type TableCellProps = React.PropsWithChildren<{
  className?: string
  addPadding?: boolean
  onClick?: MouseEventHandler
  onContextMenu?: MouseEventHandler
  onDrop?: DragEventHandler
  onWidthChange?: (newWidth: number) => void
}>

export interface TableColProps {
  id?: string
  children: React.ReactNode
  width?: number
  onWidthChange?: (newWidth: number) => void
  onClick?: MouseEventHandler
  onContextMenu?: MouseEventHandler
  onDragStart?: DragEventHandler
  onDragEnd?: DragEventHandler
  onDrop?: DragEventHandler
}
