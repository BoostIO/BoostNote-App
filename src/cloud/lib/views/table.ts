import { generate } from 'shortid'
import { SerializedQuery } from '../../interfaces/db/smartView'
import {
  PropSubType,
  PropType,
  StaticPropType,
} from '../../interfaces/db/props'
import { isString } from '../utils/string'
import { sortByAttributeAsc } from '../../../design/lib/utils/array'
import { LexoRank } from 'lexorank'
import { getArrayFromRecord } from '../utils/array'
import { SerializedView, ViewParent } from '../../interfaces/db/view'

export interface ViewTableData {
  columns: Record<string, Column>
  sort?: ViewTableSortingOptions
  filter?: SerializedQuery
}

export type ViewTableSortingOptions =
  | {
      type: 'static'
      sort: 'creation_date' | 'title_az' | 'title_za'
    }
  | {
      type: 'column'
      columnId: string
    }

export function makeTablePropColId(
  name: string,
  type: PropType | StaticPropType,
  subType?: PropSubType
) {
  return (
    generate() +
    ':' +
    name +
    ':' +
    `${type}${subType != null ? `:${subType}` : ''}`
  )
}

export function getGeneratedIdFromColId(colId: string) {
  return colId.split(':').shift()
}

export function getPropTypeFromColId(colId: string) {
  return colId.split(':').pop() as PropSubType | PropType
}

export interface StaticPropCol {
  prop: StaticPropType
}

export interface PropCol {
  type: PropType
  subType?: PropSubType
}

export type Column = {
  id: string
  name: string
  order: string
} & (PropCol | StaticPropCol)

export function isColumn(item: any): item is Column {
  return isStaticPropCol(item) || isPropCol(item)
}

export function isPropCol(item: any): item is PropCol {
  return item != null && typeof item.type === 'string'
}

export function isStaticPropCol(item: any): item is StaticPropCol {
  return item != null && typeof item.prop === 'string'
}

export type ViewTable = Column[]

export function isViewTableData(data: any): data is ViewTableData {
  return data.columns != null && Object.values(data.columns).every(isString)
}

export function getInsertedColumnOrder(columns: Record<string, Column> = {}) {
  const colValues =
    Object.keys(columns).length === 0
      ? []
      : sortByAttributeAsc('order', Object.values(columns))
  if (colValues.length === 0) {
    return LexoRank.middle().toString()
  } else {
    return LexoRank.max()
      .between(LexoRank.parse(colValues[colValues.length - 1].order))
      .toString()
  }
}

export type ColumnMoveType =
  | 'before'
  | 'after'
  | {
      targetId: string
      type: 'before' | 'after'
    }

export function getColumnOrderAfterMove(
  columns: Record<string, Column> = {},
  movedColumnId: string,
  move: ColumnMoveType
): string | undefined {
  const colValues = sortTableViewColumns(columns)
  const movedColumnIndex = colValues.findIndex(
    (col) => col.id === movedColumnId
  )
  if (colValues.length === 0 || movedColumnIndex === -1) {
    return
  }

  if (move === 'before') {
    if (movedColumnIndex === 0) {
      return colValues[movedColumnIndex].order
    }

    if (movedColumnIndex === 1) {
      return LexoRank.min()
        .between(LexoRank.parse(colValues[movedColumnIndex - 1].order))
        .toString()
    }

    return LexoRank.parse(colValues[movedColumnIndex - 2].order)
      .between(LexoRank.parse(colValues[movedColumnIndex - 1].order))
      .toString()
  } else if (move === 'after') {
    if (movedColumnIndex === colValues.length - 1) {
      return colValues[movedColumnIndex].order
    }

    if (movedColumnIndex === colValues.length - 2) {
      return LexoRank.max()
        .between(LexoRank.parse(colValues[movedColumnIndex + 1].order))
        .toString()
    }
    return LexoRank.parse(colValues[movedColumnIndex + 2].order)
      .between(LexoRank.parse(colValues[movedColumnIndex + 1].order))
      .toString()
  }

  return getColumnOrderAfterMove(columns, move.targetId, move.type)
}

export function sortTableViewColumns(
  columns: Record<string, Column> = {}
): Column[] {
  if (Object.keys(columns).length === 0) {
    return []
  }

  Object.keys(columns).forEach((key) => {
    if (columns[key].order == null) {
      columns[key].order = LexoRank.middle().toString()
    }
  })

  return sortByAttributeAsc('order', getArrayFromRecord(columns))
}

export function getDefaultTableView(
  parent: ViewParent
): SerializedView<ViewTableData> {
  const labelColId = makeTablePropColId('Label', 'label')
  return {
    id: -1,
    workspace: parent.type === 'workspace' ? parent.target : undefined,
    workspaceId: parent.type === 'workspace' ? parent.target.id : undefined,
    folder: parent.type === 'folder' ? parent.target : undefined,
    folderId: parent.type === 'folder' ? parent.target.id : undefined,
    smartView: parent.type === 'smartView' ? parent.target : undefined,
    smartViewId: parent.type === 'smartView' ? parent.target.id : undefined,
    type: 'table',
    name: 'Table',
    data: {
      columns: {
        [labelColId]: {
          id: labelColId,
          prop: 'label',
          name: 'Label',
          order: LexoRank.min().between(LexoRank.middle()).toString(),
        },
      },
      sort: { type: 'static', sort: 'creation_date' },
    },
  } as SerializedView<ViewTableData>
}

export function isDefaultView(view: SerializedView<any>) {
  return view.id === -1
}
