import { SerializedDocWithSupplemental } from '../../../interfaces/db/doc'
import { SerializedView } from '../../../interfaces/db/view'
import { KanbanProps } from '../../../../design/components/organisms/Kanban'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  insertList,
  KanbanList,
  makeFromData,
  insertItem,
  KanbanViewData,
  makeList,
  removeList,
  KanbanViewProp,
} from '../../views/kanban'
import { aperture, last, sortBy } from 'ramda'
import { prop } from '../../realtime/lib/functional'
import { useCloudApi } from '../useCloudApi'
import { SerializedPropData } from '../../../interfaces/db/props'
import { BulkApiActionRes } from '../../../../design/lib/hooks/useBulkApi'

interface KanbanViewProps {
  view: SerializedView
  docs: SerializedDocWithSupplemental[]
}

export interface KanbanViewList extends KanbanList {
  items: SerializedDocWithSupplemental[]
}

type State = Pick<
  KanbanProps<SerializedDocWithSupplemental, KanbanViewList>,
  'lists' | 'onItemMove'
> & {
  onListMove: (
    list: KanbanViewList,
    move?: KanbanViewList | 'left' | 'right'
  ) => void
  prop: string
  addList: (id: string) => void
  setProp: (prop: string) => void
  setProperties: (
    props: Record<string, KanbanViewProp>
  ) => Promise<BulkApiActionRes>
  removeList: (list: KanbanViewList) => void
}

export function useKanbanView({ view, docs }: KanbanViewProps): State {
  const { updateDocPropsApi, updateViewApi } = useCloudApi()
  const [viewData, setViewData] = useState(() => makeFromData(view.data))
  const [awaitedMoves, setAwaitedMoves] = useState(
    () => new Map<string, string>()
  )

  const saveViewData = useCallback(
    (fn: (current: KanbanViewData) => KanbanViewData) => {
      setViewData((curr) => {
        const next = fn(curr)
        updateViewApi(view, { data: next })
        return next
      })
    },
    [updateViewApi, view]
  )

  useEffect(() => {
    setViewData(makeFromData(view.data))
  }, [view.data])

  const docStatusPartition = useMemo(() => {
    return partitionByStatus(docs, awaitedMoves, viewData.statusProp)
  }, [docs, viewData.statusProp, awaitedMoves])

  const lists: KanbanViewList[] = useMemo(() => {
    return sortBy(
      prop('order'),
      viewData.lists.map((list) => {
        const items = docStatusPartition.get(list.id) || []
        return { ...list, items: items.sort(sortWithOrdering(list.ordering)) }
      })
    )
  }, [viewData.lists, docStatusPartition])

  const onListMove: State['onListMove'] = useCallback(
    (list, after) => {
      saveViewData(insertList(list, after))
    },
    [saveViewData]
  )

  const onItemMove: State['onItemMove'] = useCallback(
    async (list, item, after) => {
      saveViewData((data) => {
        return insertItem(
          list,
          item.id,
          after != null ? after.id : undefined
        )(
          aperture(2, list.items).reduce(
            (data, [after, before]) =>
              insertItem(list, before.id, after.id)(data),
            insertItem(list, list.items[0].id)(data)
          )
        )
      })
      if (!statusPropEq(item.props[viewData.statusProp], Number(list.id))) {
        try {
          setAwaitedMoves((prev) => {
            const newMap = new Map(prev)
            newMap.set(item.id, list.id)
            return newMap
          })
          await updateDocPropsApi(item, [
            viewData.statusProp,
            { type: 'status', data: Number(list.id) },
          ])
        } finally {
          setAwaitedMoves((prev) => {
            if (prev.get(item.id) === list.id) {
              const newMap = new Map(prev)
              newMap.delete(item.id)
              return newMap
            }
            return prev
          })
        }
      }
    },
    [saveViewData, updateDocPropsApi, viewData.statusProp]
  )

  return {
    prop: viewData.statusProp,
    lists,
    onItemMove,
    onListMove,
    setProperties: (props) => {
      return updateViewApi(view, {
        data: { ...view.data, props },
      })
    },
    addList: (id) => {
      saveViewData((curr) => {
        return insertList(makeList(id), last(curr.lists))(curr)
      })
    },
    setProp: (prop) => {
      saveViewData((curr) => {
        if (curr.statusProp === prop) {
          return curr
        }
        return { ...curr, statusProp: prop }
      })
    },
    removeList: (list) => {
      saveViewData(removeList(list))
    },
  }
}

function statusPropEq(
  prop: SerializedPropData | undefined,
  val: number
): boolean {
  if (
    prop == null ||
    prop.type !== 'status' ||
    prop.data == null ||
    Array.isArray(prop.data)
  ) {
    return false
  }

  return prop.data.id === val
}

function partitionByStatus(
  docs: SerializedDocWithSupplemental[],
  awaitedMoves: Map<string, string>,
  propName: string
): Map<string, SerializedDocWithSupplemental[]> {
  const map = new Map<string, SerializedDocWithSupplemental[]>()
  for (const doc of docs) {
    const statusId = awaitedMoves.get(doc.id) || getStatusPropId(doc, propName)
    if (statusId != null) {
      const arr = map.get(statusId.toString()) || []
      arr.push(doc)
      map.set(statusId.toString(), arr)
    } else {
      const arr = map.get('none') || []
      arr.push(doc)
      map.set('none', arr)
    }
  }
  return map
}

function getStatusPropId(doc: SerializedDocWithSupplemental, name: string) {
  const prop = doc.props[name]
  if (prop != null && prop.type === 'status' && prop.data != null) {
    const status = Array.isArray(prop.data) ? prop.data[0] : prop.data
    if (status != null) {
      return status.id
    }
  }
  return null
}

function sortWithOrdering(ordering: KanbanList['ordering']) {
  return (
    a: SerializedDocWithSupplemental,
    b: SerializedDocWithSupplemental
  ) => {
    const aRank = ordering[a.id]
    const bRank = ordering[b.id]
    if (aRank == null && bRank == null) {
      return a.createdAt.localeCompare(b.createdAt)
    }

    if (aRank == null) {
      return 1
    }

    if (bRank == null) {
      return -1
    }

    if (aRank === bRank) {
      return 0
    }
    const val = aRank > bRank ? 1 : -1
    return val
  }
}
