import { capitalize } from 'lodash'
import React, { useCallback } from 'react'
import { DndContext, DragOverlay } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import styled from '../../../lib/styled'
import {
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import cc from 'classcat'
import useMultiContainerDragDrop, { Move } from './hook'
import { AppComponent } from '../../../lib/types'

interface Identifyable {
  id: string
}

interface KanbanList<T extends Identifyable> extends Identifyable {
  items: T[]
}

interface KanbanProps<T extends Identifyable> {
  className?: string
  lists: KanbanList<T>[]
  onItemSort: (item: T, after?: T) => void
  onItemMove: (targetList: KanbanList<T>, item: T, after?: T) => void
  onListMove: (list: KanbanList<T>, after?: KanbanList<T> | null) => void
  onItemCreate: (list: KanbanList<T>, text: string) => void
  renderItem: (item: T) => React.ReactNode
  renderHeader?: (list: KanbanList<T>) => React.ReactNode
}

// test with external updates to lists
const Kanban = <T extends Identifyable>({
  className,
  lists,
  onItemSort,
  onItemMove,
  onListMove,
  renderHeader,
  renderItem,
}: KanbanProps<T>) => {
  const onMove = useCallback(
    (move: Move<T>) => {
      switch (move.type) {
        case 'container': {
          onListMove(move.container, move.after)
          break
        }
        case 'in-container': {
          onItemSort(move.item, move.after)
          break
        }
        case 'cross-container': {
          onItemMove(move.new, move.item, move.after)
        }
      }
    },
    [onItemSort, onItemMove, onListMove]
  )
  const { containers, active, ...dndProps } = useMultiContainerDragDrop(
    lists,
    onMove
  )

  return (
    <DndContext {...dndProps}>
      <Container className={cc(['kanban__container', className])}>
        <SortableContext items={lists} strategy={horizontalListSortingStrategy}>
          {containers.map((list) => {
            return (
              <Sortable className='kanban__list' key={list.id} id={list.id}>
                <div>
                  {renderHeader != null
                    ? renderHeader(list)
                    : capitalize(list.id.toString())}
                </div>
                <SortableContext
                  items={list.items}
                  strategy={verticalListSortingStrategy}
                >
                  {list.items.map((item) => (
                    <Sortable
                      className='kanban__item'
                      key={item.id}
                      id={item.id}
                    >
                      {renderItem(item)}
                    </Sortable>
                  ))}
                </SortableContext>
              </Sortable>
            )
          })}
        </SortableContext>
      </Container>
      <DragOverlay>{active != null && renderItem(active)}</DragOverlay>
    </DndContext>
  )
}

const Sortable: AppComponent<React.PropsWithChildren<Identifyable>> = ({
  id,
  children,
  className,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isSorting,
    isDragging,
  } = useSortable({ id })

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

const Container = styled.div`
  display: inline-grid;
  box-sizing: border-box;
  grid-auto-flow: column;
  gap: 10px;

  & .kanban__list {
    width: 250px;
  }

  & .kanban__item {
    cursor: grab;
  }
`

export default Kanban
