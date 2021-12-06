import { getOrdering, rebalance } from '../ordering'

interface KanbanList {
  status: number
  ordering: Record<string, string>
  order: string
}

interface KanbanViewData {
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
          .filter((list: any) => typeof list.status === 'number')
          .map((list: any) => {
            return {
              status: list.status,
              ordering: list.ordering || {},
              order: list.order || '',
            }
          })
      : [],
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

export function makeList(status: number) {
  return { status, ordering: {}, order: '' }
}

export function insertList(
  newList: KanbanList,
  after?: KanbanList
): KanbanUpdate {
  return (kanban) => {
    const lists = kanban.lists.filter((list) => list.status !== newList.status)
    const order = getOrdering((a, b) => a.status === b.status, lists, after)
    return { ...kanban, lists: kanban.lists.concat([{ ...newList, order }]) }
  }
}

export function removeList(
  toDelete: KanbanList,
  kanban: KanbanViewData
): KanbanViewData {
  return {
    ...kanban,
    lists: kanban.lists.filter((list) => list.status !== toDelete.status),
  }
}

export function setListItemOrder(
  list: KanbanList,
  order: { id: string; order: string }[]
): KanbanUpdate {
  return (kanban) => {
    const ordering = Object.fromEntries(
      rebalance(order).map((item) => [item.id, item.order])
    )
    return {
      ...kanban,
      lists: kanban.lists.map((lst) =>
        lst.status === list.status ? { ...list, ordering } : lst
      ),
    }
  }
}
