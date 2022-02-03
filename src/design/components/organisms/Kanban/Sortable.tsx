import React from 'react'
import cc from 'classcat'
import { CSS } from '@dnd-kit/utilities'
import { useSortable } from '@dnd-kit/sortable'
import { AppComponent } from '../../../lib/types'
import { Identifyable } from './hook'

const Sortable: AppComponent<
  React.PropsWithChildren<Identifyable & { disabled: boolean }>
> = ({ id, children, className, disabled }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isSorting,
    isDragging,
  } = useSortable({ id, disabled })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      className={cc([
        className,
        isSorting && 'sorting',
        isDragging && 'dragging',
      ])}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  )
}

export default Sortable
