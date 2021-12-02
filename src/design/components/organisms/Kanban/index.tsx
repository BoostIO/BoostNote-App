import { capitalize } from 'lodash'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  closestCenter,
  CollisionDetection,
  DndContext,
  rectIntersection,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import styled from '../../../lib/styled'
import {
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { prop } from 'ramda'

interface Identifyable {
  id: string
}

interface KanbanList<T extends Identifyable> extends Identifyable {
  items: T[]
}

interface KanbanProps<T extends Identifyable> {
  lists: KanbanList<T>[]
  onItemMove: (targetList: KanbanList<T>, item: T) => void
  onListMove: (list: KanbanList<T>, before: KanbanList<T> | null) => void
  onItemCreate: (list: KanbanList<T>, text: string) => void
  renderItem: (item: T) => React.ReactNode
  renderHeader?: (list: KanbanList<T>) => React.ReactNode
}

type Delta = { itemId: string; listId: string }

const Kanban = <T extends Identifyable>({
  lists,
  renderHeader,
  renderItem,
}: KanbanProps<T>) => {
  const [activeId, setActiveId] = useState<string | null>(null)
  const recentlyMovedToNewContainer = useRef(false)
  const lastOverId = useRef<string | null>(null)
  const [delta, setDelta] = useState<Delta | null>(null)

  const listMap = useMemo(() => {
    return new Map(
      lists.map((list) => [list.id, new Set(list.items.map(prop('id')))])
    )
  }, [lists])

  const itemsMap: Map<string, [T, string]> = useMemo(() => {
    return new Map(
      lists.flatMap((list) =>
        list.items.map((item) => [item.id, [item, list.id]])
      )
    )
  }, [lists])

  const collisionDetectionStrategy: CollisionDetection = useCallback(
    (args) => {
      // Start by finding any intersecting droppable
      let overId = rectIntersection(args)

      if (activeId && listMap.has(activeId)) {
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter(
            (container: any) => listMap.has(container.id)
          ),
        })
      }

      if (overId != null) {
        const list = lists.find((list) => list.id === overId)
        if (list != null) {
          // If a container is matched and it contains items (columns 'A', 'B', 'C')
          if (list.items.length > 0) {
            // Return the closest droppable within that container
            overId = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                (container: any) =>
                  container.id !== overId &&
                  list.items.some((item) => item.id === container.id)
              ),
            })
          }
        }

        lastOverId.current = overId

        return overId
      }

      // When a draggable item moves to a new container, the layout may shift
      // and the `overId` may become `null`. We manually set the cached `lastOverId`
      // to the id of the draggable item that was moved to the new container, otherwise
      // the previous `overId` will be returned which can cause items to incorrectly shift positions
      if (recentlyMovedToNewContainer.current) {
        lastOverId.current = activeId
      }

      // If no droppable is matched, return the last match
      return lastOverId.current
    },
    [activeId, lists, listMap]
  )

  const liveLists: KanbanList<T>[] = useMemo(() => {
    if (delta == null) {
      return lists
    }

    const itemInfo = itemsMap.get(delta.itemId)
    if (itemInfo == null) {
      return lists
    }

    const [item, currentList] = itemInfo

    if (currentList === delta.listId) {
      return lists
    }

    return lists.map((list) => {
      if (list.id === delta.listId) {
        return { ...list, items: [item, ...list.items] }
      }

      if (list.id === currentList) {
        return {
          ...list,
          items: list.items.filter((listItem) => listItem.id !== item.id),
        }
      }

      return list
    })
  }, [lists, itemsMap, delta])

  return (
    <DndContext
      collisionDetection={collisionDetectionStrategy}
      onDragOver={({ active, over }) => {
        if (over == null || listMap.has(active.id)) {
          return
        }
        const item = itemsMap.get(active.id)
        const overContainer = listMap.get(item != null ? item[1] : active.id)
        console.log(item, overContainer)
        if (overContainer == null || overContainer.has(active.id)) {
          return
        }

        console.log(item, overContainer)
        setDelta({ itemId: active.id, listId: over.id })
      }}
    >
      <Container>
        <SortableContext items={lists}>
          {liveLists.map((list) => {
            return (
              <Sortable key={list.id} id={list.id}>
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
                    <Sortable key={item.id} id={item.id}>
                      {renderItem(item)}
                    </Sortable>
                  ))}
                </SortableContext>
              </Sortable>
            )
          })}
        </SortableContext>
      </Container>
    </DndContext>
  )
}

const Sortable = ({ id, children }: React.PropsWithChildren<Identifyable>) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  )
}

const Container = styled.div`
  display: inline-grid;
  box-sizing: border-box;
  padding: 20;
  grid-auto-flow: column;
`

export default Kanban
