import { Array as YArray, Map as YMap, Doc as YDoc } from 'yjs'
import { makePropKey, PropType } from './props'
import {
  mdiAccountCircleOutline,
  mdiCalendarOutline,
  mdiCheckboxMarkedOutline,
  mdiGithub,
  mdiLink,
  mdiNumeric,
  mdiText,
} from '@mdi/js'
import { v4 as uuid } from 'uuid'

interface DataPropCol {
  prop: string
  name: string
}

export interface PropCol {
  id: string
  name: string
  type: PropType
}

export type Column = PropCol | DataPropCol

export type YTable = YArray<Column>

export function getYTable(id: string, doc: YDoc): YTable {
  return sanitize(doc.getArray(id))
}

export function addColumn(column: Column, table: YTable): YTable {
  table.doc?.transact(() => {
    if (!contains(column, table)) {
      table.push([sanitizeColumn(column)])
    }
  })
  return table
}

export function moveColumn(
  target: number | 'left' | 'right',
  column: Column,
  table: YTable
): YTable {
  table.doc?.transact(() => {
    let from = -1
    for (let i = 0; i < table.length; i++) {
      if (eq(table.get(i), column)) {
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

    table.delete(from)
    table.insert(Math.min(normalizedTarget, table.length), [column])
  })
  return table
}

export function deleteColumn(
  column: Column,
  table: YTable,
  rows: YMap<string>[] = []
): YTable {
  table.doc?.transact(() => {
    for (let i = 0; i < table.length; i++) {
      if (eq(table.get(i), column)) {
        table.delete(i)
      }
    }
    if (isPropCol(column)) {
      for (const row of rows) {
        row.delete(toPropKey(column))
      }
    }
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
    const newCol = { ...column, name }

    if (isPropCol(column)) {
      const key = toPropKey(column)
      const newKey = toPropKey(newCol as PropCol)
      for (const row of rows) {
        row.set(newKey, row.get(key) || '')
        row.delete(key)
      }
    }

    updateColumn(newCol, table)
  })
  return table
}

export function setColumnType(
  column: PropCol,
  type: PropType,
  table: YTable,
  rows: YMap<string>[] = []
): YTable {
  table.doc?.transact(() => {
    const newCol = { ...column, type }
    const newKey = toPropKey(newCol)
    const oldKey = toPropKey(column)
    for (const row of rows) {
      row.set(newKey, '')
      row.delete(oldKey)
    }

    updateColumn(newCol, table)
  })

  return table
}

export function updateColumn(column: Column, yarr: YArray<Column>) {
  for (let i = 0; i < yarr.length; i++) {
    if (eq(yarr.get(i), column)) {
      yarr.delete(i)
      yarr.insert(i, [column])
    }
  }
  return yarr
}

export function sanitize(columns: YTable) {
  for (let i = columns.length - 1; i >= 0; i--) {
    if (!isColumn(columns.get(i))) {
      const item = columns.get(1)
      if (item instanceof YArray) {
        console.log(item.toArray())
      }
      console.log('removing', item)
      columns.delete(i)
    }
  }

  return columns
}

function sanitizeColumn(col: Column): Column {
  return isDataPropCol(col)
    ? makeDataPropCol(col.name, col.prop)
    : { id: col.id, name: col.name, type: col.type }
}

export function toArray(ytable: YTable): Column[] {
  return ytable.toArray()
}

export function getColumnName(col: Column): string {
  return col.name
}

export function makeDataPropCol(name: string, prop: string): DataPropCol {
  return { name, prop }
}

export function makePropCol(name: string, type: PropType): PropCol {
  return { id: uuid(), name, type }
}

export function isColumn(item: any): item is Column {
  return isDataPropCol(item) || isPropCol(item)
}

export function isPropCol(item: any): item is PropCol {
  return (
    item != null && typeof item.id === 'string' && typeof item.name === 'string'
  )
}

export function isDataPropCol(item: any): item is DataPropCol {
  return (
    item != null &&
    typeof item.prop === 'string' &&
    typeof item.name === 'string'
  )
}

export function getDataPropColName(col: DataPropCol): string {
  return col.name
}

export function getDataPropColProp(col: DataPropCol): string {
  return col.prop
}

export function getColType(col: DataPropCol): 'prop'
export function getColType(col: PropCol): PropType
export function getColType(col: Column): 'prop' | PropType
export function getColType(col: any): any {
  return isDataPropCol(col) ? 'prop' : col.type
}

export function toPropKey(col: PropCol) {
  return makePropKey(col.name, col.type)
}

export function eq(col1: Column, col2: Column): boolean {
  return isPropCol(col1)
    ? isPropCol(col2) && col1.id === col2.id
    : isDataPropCol(col2) && col1.prop === col2.prop
}

function contains(col: Column, yarr: YArray<Column>) {
  for (const item of yarr) {
    if (eq(col, item)) {
      return true
    }
  }
  return false
}

export function uniqueIdentifier(col: Column) {
  return isPropCol(col) ? col.id : col.prop
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
    case 'number':
      return mdiNumeric
    case 'text':
    default:
      return mdiText
  }
}
