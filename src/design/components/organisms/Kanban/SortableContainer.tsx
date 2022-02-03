import { useSortable } from '@dnd-kit/sortable'
import React from 'react'
import { CSS } from '@dnd-kit/utilities'
import { AppComponent } from '../../../lib/types'
import { Identifyable } from './hook'
import Container from './Container'

interface SortableContainerProps extends Identifyable {
  header: React.ReactNode
  disabled: boolean
}

const SortableContainer: React.PropsWithChildren<
  AppComponent<SortableContainerProps>
> = ({ id, disabled, className, header, children }) => {
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
    <Container
      ref={setNodeRef}
      handleProps={{ ...attributes, ...listeners }}
      className={className}
      header={header}
      style={style}
      dragging={isDragging}
      sorting={isSorting}
    >
      {children}
    </Container>
  )
}

export default SortableContainer
