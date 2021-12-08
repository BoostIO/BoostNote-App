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
import useMultiContainerDragDrop, {
  Container,
  Identifyable,
  Move,
} from './hook'
import { AppComponent } from '../../../lib/types'
import Button from '../../atoms/Button'
import { mdiDrag } from '@mdi/js'
import Flexbox from '../../atoms/Flexbox'

export interface KanbanProps<T extends Identifyable, U extends Container<T>> {
  className?: string
  lists: U[]
  onItemMove: (targetList: U, item: T, after?: T) => void
  onListMove: (list: U, after?: U) => void
  renderItem: (item: T) => React.ReactNode
  renderHeader?: (list: U) => React.ReactNode
  afterLists?: React.ReactNode
  afterItems?: React.ReactNode
  disabled?: boolean
}

const Kanban = <T extends Identifyable, U extends Container<T>>({
  className,
  lists,
  onItemMove,
  onListMove,
  renderHeader,
  renderItem,
  afterLists,
  afterItems,
  disabled = false,
}: KanbanProps<T, U>) => {
  const onMove = useCallback(
    (move: Move<T, U>) => {
      switch (move.type) {
        case 'container': {
          onListMove(move.container, move.after)
          break
        }
        case 'in-container': {
          onItemMove(move.container, move.item, move.after)
          break
        }
        case 'cross-container': {
          onItemMove(move.new, move.item, move.after)
        }
      }
    },
    [onItemMove, onListMove]
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
              <Sortable disabled={disabled} key={list.id} id={list.id}>
                <div className='kanban__list'>
                  <Flexbox>
                    <div style={{ flex: '1 0 auto' }}>
                      {renderHeader != null
                        ? renderHeader(list)
                        : capitalize(list.id.toString())}
                    </div>
                    <Button
                      variant='icon-secondary'
                      iconPath={mdiDrag}
                    ></Button>
                  </Flexbox>
                  <SortableContext
                    items={list.items}
                    strategy={verticalListSortingStrategy}
                  >
                    {list.items.map((item) => (
                      <Sortable
                        disabled={disabled}
                        className='kanban__item'
                        key={item.id}
                        id={item.id}
                      >
                        {renderItem(item)}
                      </Sortable>
                    ))}
                    {afterItems && afterItems}
                  </SortableContext>
                </div>
              </Sortable>
            )
          })}
        </SortableContext>
        {afterLists && afterLists}
      </Container>
      <DragOverlay>{active != null && renderItem(active)}</DragOverlay>
    </DndContext>
  )
}

const Sortable: AppComponent<React.PropsWithChildren<
  Identifyable & { disabled: boolean }
>> = ({ id, children, className, disabled }) => {
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

const Container = styled.div`
  display: inline-grid;
  box-sizing: border-box;
  grid-auto-flow: column;
  gap: 20px;
  width: 100%;
  overflow-x: auto;
  background-color: ${({ theme }) => theme.colors.background.primary};
  padding-bottom: ${({ theme }) => theme.sizes.spaces.df}px;

  & .kanban__list {
    width: 250px;
  }

  & .kanban__item {
    cursor: grab;
    margin: ${({ theme }) => theme.sizes.spaces.df}px 0;
  }
`

export default Kanban
