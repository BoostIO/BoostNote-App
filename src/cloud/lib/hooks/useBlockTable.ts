import { Doc as YDoc } from 'yjs'
import { useEffect, useMemo, useState } from 'react'
import { TableBlock } from '../../api/blocks'
import { AbstractType, YMap } from 'yjs/dist/src/internals'
import {
  getPropName,
  getPropType,
  isPropKey,
  PropKey,
  PropType,
} from '../blocks/props'
import {
  addColumn,
  Column,
  deleteColumn,
  getYTable,
  isPropCol,
  makePropCol,
  moveColumn,
  PropCol,
  renameColumn,
  setColumnType,
  toArray,
  toPropKey,
  YTable,
} from '../blocks/table'
import { uniq } from 'ramda'

interface PlaceholderPropCol extends PropCol {
  isPlaceholder: true
}

export interface Actions {
  addColumn: (key: Column | PlaceholderPropCol) => void
  deleteColumn: (key: Column | PlaceholderPropCol) => void
  renameColumn: (key: Column | PlaceholderPropCol, name: string) => void
  moveColumn: (
    key: Column | PlaceholderPropCol,
    direction: 'left' | 'right'
  ) => void
  setColumnType: (key: PropCol | PlaceholderPropCol, type: PropType) => void
  setCell: (
    row: string,
    col: PropCol | PlaceholderPropCol,
    data: string
  ) => void
}

export interface BlockState {
  columns: (Column | PlaceholderPropCol)[]
  rowData: Map<string, Record<PropKey, string>>
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
  const [state, setState] = useState<BlockState>(() => {
    const rowData = new Map(
      Array.from(yrows).map<[string, Record<string, string>]>(([id, map]) => [
        id,
        ymapToPropMap(map),
      ])
    )
    return {
      columns: mergeAdditional(toArray(ytable), Array.from(rowData.values())),
      rowData,
    }
  })

  useEffect(() => {
    return subscribeDeep(ytable, () => {
      setState((prev) => {
        return {
          ...prev,
          columns: mergeAdditional(
            toArray(ytable),
            Array.from(prev.rowData.values())
          ),
        }
      })
    })
  }, [ytable])

  useEffect(() => {
    const unsubscribes = Array.from(yrows).map(([id, map]) =>
      subscribe(map, () => {
        setState((prev) => {
          const newMap = new Map(prev.rowData)
          const newProps = ymapToPropMap(map)
          newMap.set(id, newProps)
          return {
            columns: mergeAdditional(
              prev.columns.filter(not(isPlaceholder)),
              Array.from(newMap.values())
            ),
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

function mergeAdditional(
  cols: Column[],
  rowData: Record<string, string>[]
): Column[] {
  const tableColsSet = new Set(cols.filter(isPropCol).map(toPropKey))

  const additional = rowData
    .flatMap(keys)
    .filter(isPropKey)
    .filter((key) => !tableColsSet.has(key))
    .map(propToPlaceholder)

  return cols.concat(additional)
}

function keys<T extends Record<string, any>>(record: T): (keyof T)[] {
  return Object.keys(record)
}

function propToPlaceholder(prop: PropKey): PlaceholderPropCol {
  return {
    ...makePropCol(getPropName(prop), getPropType(prop)),
    isPlaceholder: true,
  }
}

function buildActions(
  ytable: YTable,
  rows: Map<string, YMap<string>>
): Actions {
  return {
    addColumn: (key) => addColumn(key, ytable),
    deleteColumn: (key) => {
      deleteColumn(key, ytable, Array.from(rows.values()))
    },
    renameColumn: (key, name) => {
      if (isPlaceholder(key)) {
        addColumn(key, ytable)
      }
      renameColumn(key, name, ytable, Array.from(rows.values()))
    },
    moveColumn: (key, direction) => {
      if (isPlaceholder(key)) {
        addColumn(key, ytable)
      }
      moveColumn(direction, key, ytable)
    },
    setColumnType: (key, type) => {
      if (isPlaceholder(key)) {
        addColumn(key, ytable)
      }
      setColumnType(key, type, ytable, Array.from(rows.values()))
    },
    setCell: (row, key, value) => {
      if (rows.has(row)) {
        rows.get(row)!.set(toPropKey(key), value)
      }
    },
  }
}

function isPlaceholder(col: any): col is PlaceholderPropCol {
  return col.isPlaceholder != null && col.isPlaceholder === true
}

function not<T>(fn: (...args: T[]) => boolean) {
  return (...args: T[]) => !fn(...args)
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

function ymapToPropMap(map: YMap<string>): Record<PropKey, string> {
  return Object.fromEntries(
    Array.from(map.entries()).filter(([key]) => isPropKey(key))
  )
}
