import {
  closestCenter,
  CollisionDetection,
  KeyboardSensor,
  DndContextProps,
  MouseSensor,
  rectIntersection,
  TouchSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
  Active,
  Over,
  MeasuringStrategy,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export interface Identifyable {
  id: UniqueIdentifier
}

export interface KanbanContainer<T extends Identifyable> extends Identifyable {
  items: T[]
}

type Helpers<T extends Identifyable, U extends KanbanContainer<T>> = Partial<
  DndContextProps
> & {
  containers: U[]
  active: { type: 'item'; item: T } | { type: 'container'; item: U } | null
}

export type Move<T extends Identifyable, U extends KanbanContainer<T>> =
  | { type: 'in-container'; container: U; item: T; after?: T }
  | {
      type: 'cross-container'
      item: T
      after?: T
      previous: U
      new: U
    }
  | { type: 'container'; container: U; after: U }

function useMultiContainerDragDrop<
  T extends Identifyable,
  U extends KanbanContainer<T>
>(containers: U[], onMove: (move: Move<T, U>) => void): Helpers<T, U> {
  const [active, setActive] = useState<Helpers<T, U>['active']>(null)
  const lastOverId = useRef<string | null>(null)
  const recentlyMovedToNewContainer = useRef(false)
  const [cloned, setCloned] = useState<U[] | null>(null)

  const workingData = useMemo(() => {
    return cloned || containers
  }, [containers, cloned])

  const collisionDetection: CollisionDetection = useCallback(
    (args) => {
      let overId = rectIntersection(args)

      if (active != null && active.type === 'container') {
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter((container) =>
            containers.some((cnt) => cnt.id === container.id)
          ),
        })
      }

      if (overId != null) {
        if (overId in containers) {
          const containerItems = containers[overId]

          if (containerItems.length > 0) {
            overId = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                (container) =>
                  container.id !== overId &&
                  containerItems.includes(container.id)
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
        lastOverId.current = active?.item.id || null
      }

      return lastOverId.current
    },
    [active, containers]
  )

  useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false
    })
  }, [workingData])

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const findContainer = useCallback(
    (id: string) => {
      const list = workingData.find((list) => list.id === id)
      if (list != null) {
        return list
      }

      const containerList = workingData.find((list) =>
        list.items.some((item) => item.id === id)
      )
      return containerList != null ? containerList : null
    },
    [workingData]
  )

  const onDragCancel = useCallback(() => {
    setActive(null)
    setCloned(null)
  }, [])

  const onDragStart: DndContextProps['onDragStart'] = useCallback(
    ({ active }) => {
      const container = findContainer(active.id)
      if (container == null) {
        setActive(null)
      } else if (container.id === active.id) {
        setActive({ type: 'container', item: container })
      } else {
        const item = container.items.find((item) => item.id === active.id)
        setActive(item != null ? { type: 'item', item } : null)
      }
      setCloned(containers)
    },
    [findContainer, containers]
  )

  const onDragEnd: DndContextProps['onDragEnd'] = useCallback(
    ({ active, over }) => {
      const overId = over?.id
      if (overId == null) {
        setActive(null)
        setCloned(null)
        return
      }

      const containerIndex = workingData.findIndex(
        (list) => list.id === active.id
      )
      if (containerIndex !== -1) {
        const overContainerIndex = workingData.findIndex(
          (list) => list.id === overId
        )
        if (
          overContainerIndex !== -1 &&
          overContainerIndex !== containerIndex
        ) {
          onMove({
            type: 'container',
            container: workingData[containerIndex],
            after:
              workingData[
                containerIndex > overContainerIndex
                  ? overContainerIndex - 1
                  : overContainerIndex
              ],
          })
        }
        setActive(null)
        setCloned(null)
        return
      }

      const activeContainer = findContainer(active.id)
      const overContainer = findContainer(overId)
      if (activeContainer == null || overContainer == null) {
        setActive(null)
        setCloned(null)
        return
      }

      const activeItemIndex = activeContainer.items.findIndex(
        (item) => item.id === active.id
      )
      const overItemIndex = overContainer.items.findIndex(
        (item) => item.id === overId
      )
      if (activeItemIndex === -1) {
        setActive(null)
        setCloned(null)
        return
      }

      const realContainer = containers.find((container) =>
        container.items.some((item) => item.id === active.id)
      )
      if (realContainer == null) {
        setActive(null)
        setCloned(null)
        return
      }

      if (realContainer.id === overContainer.id) {
        if (overItemIndex !== -1 && overItemIndex !== activeItemIndex) {
          onMove({
            type: 'in-container',
            container: activeContainer,
            item: activeContainer.items[activeItemIndex],
            after:
              overContainer.items[
                activeItemIndex > overItemIndex
                  ? overItemIndex - 1
                  : overItemIndex
              ],
          })
        }
      } else {
        const afterIndex =
          overItemIndex === -1
            ? overContainer.items.length - 1
            : activeItemIndex > overItemIndex
            ? overItemIndex - 1
            : overItemIndex
        onMove({
          type: 'cross-container',
          previous: realContainer,
          new: overContainer,
          item: activeContainer.items[activeItemIndex],
          after:
            overContainer.items[afterIndex] == null ||
            overContainer.items[afterIndex].id ===
              activeContainer.items[activeItemIndex].id
              ? undefined
              : overContainer.items[afterIndex],
        })
      }

      setActive(null)
      setCloned(null)
    },
    [workingData, onMove, findContainer, containers]
  )

  const onDragOver: DndContextProps['onDragOver'] = useCallback(
    ({ active, over }) => {
      const overId = over?.id

      if (!overId) {
        return
      }

      const overContainer = findContainer(overId)
      const activeContainer = findContainer(active.id)

      if (!overContainer || !activeContainer) {
        return
      }

      if (activeContainer.id !== overContainer.id) {
        setCloned((containers) => {
          if (containers == null) {
            return containers
          }
          const overIndex = overContainer.items.findIndex(
            (item) => item.id === overId
          )
          const activeItem = activeContainer.items.find(
            (item) => item.id === active.id
          )

          if (activeItem == null) {
            return containers
          }

          let newIndex: number
          if (containers.some((list) => list.id == overId)) {
            newIndex = overContainer.items.length + 1
          } else {
            const isBelowOverItem = over && isBelow(active, over)

            const modifier = isBelowOverItem ? 1 : 0

            newIndex =
              overIndex >= 0
                ? overIndex + modifier
                : overContainer.items.length + 1
          }

          recentlyMovedToNewContainer.current = true

          return containers.map((list) => {
            if (list.id === activeContainer.id) {
              return {
                ...list,
                items: list.items.filter((item) => item.id !== active.id),
              }
            }
            if (list.id === overContainer.id) {
              return {
                ...list,
                items: [
                  ...list.items.slice(0, newIndex),
                  activeItem,
                  ...list.items.slice(newIndex, list.items.length),
                ],
              }
            }
            return list
          })
        })
      }
    },
    [findContainer]
  )

  return {
    containers: workingData,
    measuring: { droppable: { strategy: MeasuringStrategy.Always } },
    sensors,
    collisionDetection,
    onDragStart,
    onDragOver,
    onDragCancel,
    onDragEnd,
    active,
  }
}

export default useMultiContainerDragDrop

function isBelow(active: Active, over: Over): boolean {
  if (active.rect.current.translated == null) {
    return false
  }
  return (
    active.rect.current.translated.offsetTop >
    over.rect.offsetTop + over.rect.height
  )
}
