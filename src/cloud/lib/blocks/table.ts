import { v4 as uuid } from 'uuid'
import { Array as YArray, Map as YMap } from 'yjs'

export type DataType =
  | 'text'
  | 'number'
  | 'date'
  | 'url'
  | 'checkbox'
  | 'user'
  | 'prop'

export interface Column {
  id: string
  name: string
  data_type: DataType
  default?: string
}

export interface Table {
  columns: Column[]
  row_data: Map<string, Record<string, string>>
}

export function createTable(columns: Omit<Column, 'id'>[]): Table {
  return {
    columns: columns.map((col) => ({ ...col, id: uuid() })),
    row_data: new Map(),
  }
}

export function addColumn(column: Omit<Column, 'id'>, table: Table): Table {
  const id = uuid()
  return { ...table, columns: [...table.columns, { id, ...column }] }
}

export function moveColumn(target: number, column: Column, table: Table) {
  const index = table.columns.findIndex((col) => col.id === column.id)
  if (index < 0 || target < 0) {
    return table
  }

  const mutable = table.columns.slice()
  mutable.splice(index, 1)
  mutable.splice(target, 0, column)

  return { ...table, columns: mutable }
}

export function deleteColumn(column: Column, table: Table) {
  const row_data = new Map(table.row_data)
  for (const [key, data] of row_data.entries()) {
    row_data.set(key, unset(column.id, data))
  }
  const columns = table.columns.filter((col) => col.id !== column.id)
  return { columns, row_data }
}

type Alteration = Partial<Column> & { id: Column['id']; fill?: string }

export function alterColumn(
  { id, fill, ...changes }: Alteration,
  table: Table
) {
  const columns = table.columns.map((col) =>
    col.id === id ? { ...col, ...changes } : col
  )
  const newTable: Table = { ...table, columns }
  if (fill != null) {
    newTable.row_data = new Map(table.row_data)
    for (const [key, data] of newTable.row_data.entries()) {
      newTable.row_data.set(key, { ...data, [id]: fill })
    }
  }
  return newTable
}

export function setCellData(
  rowId: string,
  col: Column,
  newData: string,
  table: Table
) {
  const row_data = new Map(table.row_data)
  row_data.set(rowId, { ...(row_data.get(rowId) || {}), [col.id]: newData })
  return { ...table, row_data }
}

export function deleteRowData(id: string, table: Table) {
  const row_data = new Map(table.row_data)
  row_data.delete(id)
  return { ...table, row_data }
}

function unset<T, K extends keyof T>(
  prop: K,
  { [prop]: _remove, ...rest }: T
): Omit<T, K> {
  return rest
}

function getCols(ytable: YTable): YArray<YMap<string>> {
  let cols = ytable.get(0)
  if (!(cols instanceof YArray)) {
    ytable.insert(0, [new YArray()])
    cols = ytable.get(0)
  }
  return cols as YArray<YMap<string>>
}

function getRows(ytable: YTable): YMap<YMap<string>> {
  let rows = ytable.get(1)
  if (!(rows instanceof YMap)) {
    ytable.insert(0, [new YMap()])
    rows = ytable.get(0)
  }
  return rows as YMap<YMap<string>>
}

function isColumn(col: any): col is Column {
  return col.id != null && col.name != null && col.data_type != null
}

export function parseFrom(ytable: YTable): Table {
  let cols = getCols(ytable)
  let rows = getRows(ytable)

  const columns: Column[] = []
  for (const col of cols) {
    const parsedCol = {
      id: col.get('id'),
      name: col.get('name'),
      data_type: col.get('data_type'),
      default: col.get('default'),
    }
    if (isColumn(parsedCol)) {
      columns.push(parsedCol)
    }
  }

  const row_data: Table['row_data'] = new Map()
  for (const [id, row] of rows.entries()) {
    row_data.set(id, Object.fromEntries(row.entries()))
  }

  return { columns, row_data }
}

type YTable = YArray<YArray<YMap<string>> | YMap<YMap<string>>>
export function syncTo(ytable: YTable, table: Table, origin?: any) {
  let cols = getCols(ytable)
  let rows = getRows(ytable)

  if (ytable.doc == null) {
    return false
  }

  ytable.doc.transact(() => {
    resize(table.columns.length, () => new YMap<string>(), cols)

    for (const [i, column] of table.columns.entries()) {
      syncObject(column, cols.get(i))
    }

    for (const [key, row] of table.row_data.entries()) {
      let map = rows.get(key)
      if (map == null) {
        map = new YMap()
        rows.set(key, map)
      }
      syncObject(row, map)
    }
  }, origin)

  return true
}

function syncObject(obj: Record<string, any>, yMap: YMap<any>) {
  const existingKeys = new Set(yMap.keys())
  for (const [key, value] of Object.entries(obj)) {
    existingKeys.delete(key)
    const currentValue = yMap.get(key)
    if (currentValue !== value) {
      yMap.set(key, value)
    }
  }

  for (const key of existingKeys.values()) {
    yMap.delete(key)
  }
}

function resize<T>(
  length: number,
  fill: (i: number) => T,
  arr: YArray<T>
): YArray<T> {
  const diff = length - arr.length
  if (diff > 0) {
    for (let i = 0; i < diff; i++) {
      arr.push([fill(arr.length + i)])
    }
  } else if (diff < 0) {
    arr.delete(arr.length + diff)
  }
  return arr
}
