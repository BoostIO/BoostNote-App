import { Array as YArray, Map as YMap, Doc as YDoc } from 'yjs'
import {
  getPropName,
  getPropType,
  isPropKey,
  makePropKey,
  PropKey,
  PropType,
} from './props'
import {
  mdiAccountCircleOutline,
  mdiCalendarOutline,
  mdiCheckboxMarkedOutline,
  mdiGithub,
  mdiLink,
  mdiText,
} from '@mdi/js'

// eslint-disable-next-line prettier/prettier
type DataPropCol = `prop:${string}:${string}`

export type Column = PropKey | DataPropCol

export type YTable = YMap<YArray<string> | YMap<string>>

export function getYTable(id: string, doc: YDoc): YTable {
  return sanitize(doc.getMap(id))
}

export function addColumn(column: Column, table: YTable): YTable {
  table.doc?.transact(() => {
    const [columns, excluded] = getStructure(table)

    if (!new Set(column).has(column)) {
      columns.push([column])
    }

    excluded.delete(column)
  })
  return table
}

export function moveColumn(
  target: number | 'left' | 'right',
  column: Column,
  table: YTable
): YTable {
  table.doc?.transact(() => {
    const [columns] = getStructure(table)

    let from = -1
    for (let i = 0; i < columns.length; i++) {
      if (columns.get(i) === column) {
        from = i
      }
    }

    if (from < 0) {
      return
    }

    const normalizedTarget =
      typeof target === 'string'
        ? target === 'left'
          ? from - 1
          : from + 1
        : target

    if (normalizedTarget < 0 || normalizedTarget === from) {
      return
    }

    columns.delete(from)
    columns.insert(Math.min(normalizedTarget, columns.length), [column])
  })
  return table
}

export function deleteColumn(column: Column, table: YTable): YTable {
  table.doc?.transact(() => {
    const [columns, excluded] = getStructure(table)
    for (let i = 0; i < columns.length; i++) {
      if (columns.get(i) === column) {
        columns.delete(i)
      }
    }

    excluded.set(column, column)
  })
  return table
}

export function renameColumn(
  column: Column,
  name: string,
  table: YTable,
  rows: YMap<string>[] = []
) {
  table.doc?.transact(() => {
    const [columns] = getStructure(table)
    const newKey = isDataPropCol(column)
      ? makeDataPropCol(name, getDataPropColProp(column))
      : makePropKey(name, getPropType(column))

    if (isPropKey(column)) {
      for (const row of rows) {
        row.set(newKey, row.get(column) || '')
        row.delete(column)
      }
    }

    for (let i = 0; i < columns.length; i++) {
      if (columns.get(i) === column) {
        columns.delete(i)
        columns.insert(i, [newKey])
      }
    }
  })
  return table
}

export function setColumnType(
  column: PropKey,
  type: PropType,
  table: YTable,
  rows: YMap<string>[] = []
): YTable {
  table.doc?.transact(() => {
    const [columns] = getStructure(table)
    const newKey = makePropKey(getPropName(column), type)
    for (const row of rows) {
      row.set(newKey, '')
      row.delete(column)
    }

    for (let i = 0; i < columns.length; i++) {
      if (columns.get(i) === column) {
        columns.delete(i)
        columns.insert(i, [newKey])
      }
    }
  })

  return table
}

export function getActiveColumns(
  table: YTable,
  additional: Column[] = []
): Column[] {
  const [columns, excluded] = getStructure(table)
  return columns
    .toArray()
    .concat(additional.filter(notIn(new Set(columns))))
    .filter(notIn(new Set(excluded.keys())))
    .filter(isColumn)
}

export function sanitize(table: YTable) {
  const [columns, excluded] = getStructure(table)

  for (let i = columns.length - 1; i >= 0; i--) {
    if (!isColumn(columns.get(i))) {
      columns.delete(i)
    }
  }

  for (const key of excluded.keys()) {
    if (!isColumn(key)) {
      excluded.delete(key)
    }
  }

  return table
}

function getStructure(table: YTable): [YArray<string>, YMap<string>] {
  let cols = table.get('columns')
  if (!(cols instanceof YArray)) {
    table.set('columns', new YArray())
    cols = table.get('columns')
  }

  let excluded = table.get('excluded')
  if (!(excluded instanceof YMap)) {
    table.set('excluded', new YMap())
    excluded = table.get('excluded')
  }

  return [cols as YArray<string>, excluded as YMap<string>]
}

export function getColumnName(col: Column): string {
  return isDataPropCol(col) ? getDataPropColName(col) : getPropName(col)
}

export function makeDataPropCol(name: string, prop: string): DataPropCol {
  return `prop:${name}:${prop}`
}

export function isColumn(str: any): str is Column {
  return isDataPropCol(str) || isPropKey(str)
}

export function isDataPropCol(str: any): str is DataPropCol {
  return (
    typeof str === 'string' &&
    str.startsWith('prop:') &&
    str.split(':').length === 3
  )
}

export function getDataPropColName(col: DataPropCol): string {
  return col.split(':')[1]
}

export function getDataPropColProp(col: DataPropCol): string {
  return col.split(':')[2]
}

function notIn<T>(set: Set<T>) {
  return (item: T) => !set.has(item)
}

function getColType(col: Column): 'prop' | PropType {
  return isDataPropCol(col) ? 'prop' : col.split(':')[1] as PropType
}

export function getDataColumnIcon(col: Column) { 
  const type = getColType(col)
  switch (type) {
    case 'prop':
      return mdiGithub
    case 'date':
      return mdiCalendarOutline
    case 'user':
      return mdiAccountCircleOutline
    case 'url':
      return mdiLink
    case 'checkbox':
      return mdiCheckboxMarkedOutline
    case 'text':
    case 'number':
    default:
      return mdiText
  }
}
