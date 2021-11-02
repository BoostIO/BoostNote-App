import { generate } from 'shortid'
import { SerializedQuery } from '../../interfaces/db/dashboard'
import { PropType } from '../../interfaces/db/props'
import { isString } from '../utils/string'

export interface ViewTableData {
  columns: Record<string, Column>
  filter?: SerializedQuery
}

export function makeTablePropColId(name: string, type?: string) {
  return generate() + ':' + name + ':' + type
}

interface DataPropCol {
  id: string
  prop: string
  name: string
}

export interface PropCol {
  id: string
  name: string
  type: PropType
}

export type Column = PropCol | DataPropCol

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

export type ViewTable = Column[]

export function isViewTableData(data: any): data is ViewTableData {
  return data.columns != null && Object.values(data.columns).every(isString)
}
