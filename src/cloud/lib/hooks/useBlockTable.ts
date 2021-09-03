import { Doc as YDoc } from 'yjs'
import { useEffect, useMemo, useState } from 'react'
import { TableBlock } from '../../api/blocks'
import { AbstractType, YMap } from 'yjs/dist/src/internals'
import { isPropKey, PropKey, PropType } from '../blocks/props'
import {
  addColumn,
  Column,
  deleteColumn,
  getActiveColumns,
  getYTable,
  isColumn,
  moveColumn,
  renameColumn,
  setColumnType,
  YTable,
} from '../blocks/table'

export interface Actions {
  addColumn: (key: Column) => void
  deleteColumn: (key: Column) => void
  renameColumn: (key: Column, name: string) => void
  moveColumn: (key: Column, direction: 'left' | 'right') => void
  setColumnType: (key: PropKey, type: PropType) => void
  setCell: (row: string, col: Column, data: string) => void
}

interface State {
  columns: Column[]
  rowData: Map<string, Record<Column, string>>
}

export function useBlockTable(block: TableBlock, ydoc: YDoc) {
  const ytable = useMemo(() => {
    return getYTable(block.id, ydoc)
  }, [block.id, ydoc])
  const yrows = useMemo(() => {
    return new Map(block.children.map(({ id }) => [id, ydoc.getMap(id)]))
  }, [block.children, ydoc])
  const actions = useMemo(() => {
    return buildActions(ytable, yrows)
  }, [ytable, yrows])
  const [state, setState] = useState<State>(() => {
    const rowData = Array.from(yrows).map<[string, Record<string, string>]>(
      ([id, map]) => [id, ymapToPropMap(map)]
    )
    return {
      columns: getActiveColumns(
        ytable,
        getAvailableKeys(rowData.map(([, map]) => map))
      ),
      rowData: new Map(rowData),
    }
  })

  useEffect(() => {
    return subscribeDeep(ytable, () => {
      setState((prev) => {
        return {
          ...prev,
          columns: getActiveColumns(
            ytable,
            getAvailableKeys(Array.from(prev.rowData.values()))
          ),
        }
      })
    })
  }, [ytable])

  useEffect(() => {
    const unsubscribes = Array.from(yrows).map(([id, map]) =>
      subscribe(map, () => {
        setState((prev) => {
          const newProps = Array.from(map.keys())
            .filter(notIn(new Set<string>(prev.columns)))
            .filter(isColumn)
          const newMap = new Map(prev.rowData)
          newMap.set(id, ymapToPropMap(map))
          return {
            columns:
              newProps.length > 0
                ? prev.columns.concat(newProps)
                : prev.columns,
            rowData: newMap,
          }
        })
      })
    )

    return () => {
      for (const unsubscribe of unsubscribes) {
        unsubscribe()
      }
    }
  }, [yrows])

  return {
    state,
    actions,
  }
}

function buildActions(
  ytable: YTable,
  rows: Map<string, YMap<string>>
): Actions {
  return {
    addColumn: (key) => addColumn(key, ytable),
    deleteColumn: (key) => deleteColumn(key, ytable),
    renameColumn: (key, name) => {
      renameColumn(key, name, ytable, Array.from(rows.values()))
    },
    moveColumn: (key, direction) => moveColumn(direction, key, ytable),
    setColumnType: (key, type) => {
      setColumnType(key, type, ytable, Array.from(rows.values()))
    },
    setCell: (row, key, value) => {
      console.log(row, key, value)
      if (rows.has(row)) {
        rows.get(row)!.set(key, value)
      }
    },
  }
}

function subscribe<T extends AbstractType<any>>(
  map: T,
  fn: ArgsType<T['observe']>[0]
) {
  map.observe(fn)
  return () => map.unobserve(fn)
}

function subscribeDeep<T extends AbstractType<any>>(
  map: T,
  fn: ArgsType<T['observeDeep']>[0]
) {
  map.observeDeep(fn)
  return () => map.unobserveDeep(fn)
}

function getAvailableKeys(maps: Record<string, string>[]): PropKey[] {
  return Array.from(
    new Set(
      maps.flatMap((map) => Array.from(Object.keys(map)).filter(isPropKey))
    )
  )
}

function ymapToPropMap(map: YMap<string>): Record<PropKey, string> {
  return Object.fromEntries(
    Array.from(map.entries()).filter(([key]) => isPropKey(key))
  )
}

function notIn<T>(set: Set<T>) {
  return (item: T) => !set.has(item)
}
