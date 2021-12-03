import { capitalize } from 'lodash'
import React from 'react'
import { DndContext } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import styled from '../../../lib/styled'
import {
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import cc from 'classcat'
import useMultiContainerDragDrop from './hook'
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
  onItemMove: (targetList: KanbanList<T>, item: T) => void
  onListMove: (list: KanbanList<T>, before: KanbanList<T> | null) => void
  onItemCreate: (list: KanbanList<T>, text: string) => void
  renderItem: (item: T) => React.ReactNode
  renderHeader?: (list: KanbanList<T>) => React.ReactNode
}

// test with external updates to lists
const Kanban = <T extends Identifyable>({
  className,
  lists,
  renderHeader,
  renderItem,
}: KanbanProps<T>) => {
  const { containers, ...dndProps } = useMultiContainerDragDrop(
    lists,
    console.log
  )

  return (
    <DndContext {...dndProps}>
      <div className={cc(['kanban__container', className])}>
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
      </div>
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

const StyledKanban = styled(Kanban)`
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

export default StyledKanban
