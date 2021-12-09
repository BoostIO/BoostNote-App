import { omit, prop, sortBy } from 'ramda'
import { getOrdering } from '../ordering'

export interface KanbanList {
  id: string
  ordering: Record<string, string>
  order: string
}

export interface KanbanViewData {
  lists: KanbanList[]
  statusProp: string
  ordering: 'drag-drop' | 'title:asc' | 'title:desc'
}

type KanbanUpdate = (kanban: KanbanViewData) => KanbanViewData

export function makeFromData(data: any): KanbanViewData {
  return {
    statusProp: data.statusProp || 'Status',
    ordering: data.ordering || 'drag-drop',
    lists: Array.isArray(data.lists)
      ? data.lists
          .filter(isKanbanList)
          .map(({ id, ordering, order }: KanbanList) => ({
            id,
            ordering,
            order,
          }))
      : [{ id: 'none', order: '0|', ordering: {} }],
  }
}

export function changeStatusProp(status: string): KanbanUpdate {
  return (kanban) => ({ ...kanban, statusProp: status })
}

export function setOrdering(
  ordering: KanbanViewData['ordering']
): KanbanUpdate {
  return (kanban) => ({ ...kanban, ordering })
}

export function makeList(id: string): KanbanList {
  return { id, ordering: {}, order: '' }
}

export function insertList(
  newList: KanbanList,
  after?: KanbanList | 'left' | 'right'
): KanbanUpdate {
  return (kanban) => {
    const afterItem =
      typeof after === 'string' ? getMoveAfter(after, newList, kanban) : after
    const lists = kanban.lists.filter((list) => list.id !== newList.id)
    const order = getOrdering(
      lists,
      afterItem != null ? (a) => a.id === afterItem.id : undefined
    )
    return {
      ...kanban,
      lists: lists.concat([
        { id: newList.id, ordering: newList.ordering, order },
      ]),
    }
  }
}

export function removeList(toDelete: KanbanList): KanbanUpdate {
  return (kanban) => ({
    ...kanban,
    lists: kanban.lists.filter((list) => list.id !== toDelete.id),
  })
}

export function insertItem(
  list: KanbanList,
  item: string,
  after?: string
): KanbanUpdate {
  return (kanban) => {
    return { ...kanban, lists: kanban.lists.map(doItemMove(list, item, after)) }
  }
}

function getMoveAfter(
  move: 'right' | 'left',
  list: KanbanList,
  data: KanbanViewData
) {
  const sorted = sortBy(prop('order'), data.lists)
  const index = sorted.findIndex((lst) => lst.id === list.id)
  if (index === -1) {
    return sorted[sorted.length - 1]
  }
  const offset = move === 'right' ? 1 : -2
  const insertIndex = Math.min(index + offset, sorted.length - 1)
  return sorted[insertIndex]
}

function doItemMove(insertList: KanbanList, item: string, after?: string) {
  return (list: KanbanList) => {
    if (list.id !== insertList.id) {
      return list.ordering[item] != null
        ? {
            id: list.id,
            order: list.order,
            ordering: omit([item], list.ordering),
          }
        : list
    }

    const order = getOrdering(
      toOrdering(omit([item], list.ordering)),
      after != null ? (a) => a.id === after : undefined
    )

    if (order === list.ordering[item]) {
      return list
    }

    return {
      id: list.id,
      order: list.order,
      ordering: { ...list.ordering, [item]: order },
    }
  }
}

function isKanbanList(data: any): data is KanbanList {
  return (
    data != null &&
    typeof data.id === 'string' &&
    typeof data.order === 'string' &&
    data.ordering != null
  )
}

function toOrdering(ordering: KanbanList['ordering']) {
  return Object.entries(ordering).map(([id, order]) => ({ id, order }))
}
