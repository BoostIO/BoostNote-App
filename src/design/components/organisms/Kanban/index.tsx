import { capitalize } from 'lodash'
import React, { useCallback } from 'react'
import { DndContext, DragOverlay } from '@dnd-kit/core'
import styled from '../../../lib/styled'
import {
  horizontalListSortingStrategy,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import cc from 'classcat'
import useMultiContainerDragDrop, {
  KanbanContainer,
  Identifyable,
  Move,
} from './hook'
import Sortable from './Sortable'
import SortableContainer from './SortableContainer'
import ContainerComponent from './Container'
import Scroller from '../../atoms/Scroller'

export interface KanbanProps<
  T extends Identifyable,
  U extends KanbanContainer<T>
> {
  className?: string
  lists: U[]
  onItemMove: (targetList: U, item: T, after?: T) => void
  onListMove: (list: U, after?: U) => void
  renderItem: (item: T) => React.ReactNode
  renderHeader?: (list: U) => React.ReactNode
  afterLists?: React.ReactNode
  afterItems?: (list: U) => React.ReactNode
  disabled?: boolean
}

const Kanban = <T extends Identifyable, U extends KanbanContainer<T>>({
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
    <Scroller>
      <DndContext {...dndProps}>
        <KanbanContainer className={cc(['kanban__container', className])}>
          <SortableContext
            items={lists}
            strategy={horizontalListSortingStrategy}
          >
            {containers.map((list) => {
              return (
                <SortableContainer
                  header={
                    renderHeader != null
                      ? renderHeader(list)
                      : capitalize(list.id.toString())
                  }
                  disabled={disabled}
                  key={list.id}
                  id={list.id}
                >
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
                    {afterItems && afterItems(list)}
                  </SortableContext>
                </SortableContainer>
              )
            })}
          </SortableContext>
          {afterLists && afterLists}
        </KanbanContainer>
        <DragOverlay>
          {active != null && (
            <Overlay
              active={active}
              renderItem={renderItem}
              renderHeader={renderHeader}
            />
          )}
        </DragOverlay>
      </DndContext>
    </Scroller>
  )
}

interface OverlayProps {
  active: ReturnType<typeof useMultiContainerDragDrop>['active']
  renderHeader: KanbanProps<any, any>['renderHeader']
  renderItem: KanbanProps<any, any>['renderItem']
}

const Overlay = ({ active, renderHeader, renderItem }: OverlayProps) => {
  if (active == null) {
    return null
  }

  if (active.type === 'item') {
    return (
      <div className='kanban__item__wrapper'>{renderItem(active.item)}</div>
    )
  }

  return (
    <ContainerComponent
      header={
        renderHeader != null
          ? renderHeader(active.item)
          : capitalize(active.item.id.toString())
      }
    >
      {active.item.items.map((item) => (
        <div key={item.id} className='kanban__item'>
          {renderItem(item)}
        </div>
      ))}
    </ContainerComponent>
  )
}

const KanbanContainer = styled.div`
  display: inline-grid;
  box-sizing: border-box;
  grid-auto-flow: column;
  gap: 20px;
  min-height: 250px;
  background-color: ${({ theme }) => theme.colors.background.primary};
  padding-bottom: ${({ theme }) => theme.sizes.spaces.df}px;
  padding-left: ${({ theme }) => theme.sizes.spaces.l}px;
`

export default Kanban
