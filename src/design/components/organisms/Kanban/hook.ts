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

export interface Container<T extends Identifyable> extends Identifyable {
  items: T[]
}

type Helpers<T extends Identifyable> = Partial<DndContextProps> & {
  containers: Container<T>[]
}

export type Move<T extends Identifyable> =
  | { type: 'in-container'; item: T; after?: T }
  | {
      type: 'cross-container'
      item: T
      after?: T
      previous: Container<T>
      new: Container<T>
    }
  | { type: 'container'; container: Container<T>; after: Container<T> }

// make list map on liveLists
// try delta approach
// extract to hook

function useMultiContainerDragDrop<T extends Identifyable>(
  containers: Container<T>[],
  onMove: (move: Move<T>) => void
): Helpers<T> {
  const [activeId, setActiveId] = useState<string | null>(null)
  const lastOverId = useRef<string | null>(null)
  const recentlyMovedToNewContainer = useRef(false)
  //const isSortingContainer = activeId ? containers.includes(activeId) : false
  const [cloned, setCloned] = useState<Container<T>[] | null>(null)

  const workingData = useMemo(() => {
    return cloned || containers
  }, [containers, cloned])

  const collisionDetection: CollisionDetection = useCallback(
    (args) => {
      let overId = rectIntersection(args)

      if (activeId && activeId in containers) {
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter(
            (container) => container.id in containers
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
        lastOverId.current = activeId
      }

      return lastOverId.current
    },
    [activeId, containers]
  )

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
    setActiveId(null)
    setCloned(null)
  }, [])

  const onDragStart: DndContextProps['onDragStart'] = useCallback(
    ({ active }) => {
      setActiveId(active.id)
      setCloned(containers)
    },
    [containers]
  )

  // manage before / afters
  const onDragEnd: DndContextProps['onDragEnd'] = useCallback(
    ({ active, over }) => {
      // if not over anything -> end
      const overId = over?.id
      if (overId == null) {
        setActiveId(null)
        setCloned(null)
        return
      }
      // if container and over other container -> container move
      const containerIndex = workingData.findIndex(
        (list) => list.id === active.id
      )
      if (containerIndex !== -1) {
        const overContainerIndex = workingData.findIndex(
          (list) => list.id === overId
        )
        if (overContainerIndex !== -1) {
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
        setActiveId(null)
        setCloned(null)
        return
      }
      // if active id not in container -> end
      const activeContainer = findContainer(active.id)
      const overContainer = findContainer(overId)
      if (activeContainer == null || overContainer == null) {
        setActiveId(null)
        setCloned(null)
        return
      }

      //   - get over item
      const activeItemIndex = activeContainer.items.findIndex(
        (item) => item.id === active.id
      )
      const overItemIndex = overContainer.items.findIndex(
        (item) => item.id === overId
      )
      if (activeItemIndex === -1) {
        setActiveId(null)
        setCloned(null)
        return
      }

      const realContainer = containers.find((container) =>
        container.items.some((item) => item.id === active.id)
      )
      if (realContainer == null) {
        setActiveId(null)
        setCloned(null)
        return
      }

      if (realContainer.id === overContainer.id) {
        if (overItemIndex !== -1) {
          onMove({
            type: 'in-container',
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
        // if -1 overItem -> items.length - 1
        // else
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
          after: overContainer.items[afterIndex],
        })
      }

      //   - if container is active container -> in-container move
      //   - else -> cross-container move
      setActiveId(null)
      setCloned(null)
    },
    [workingData, onMove, findContainer, containers]
  )

  useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false
    })
  }, [workingData])

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

          if (activeItem === null) {
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
          }) as any
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
