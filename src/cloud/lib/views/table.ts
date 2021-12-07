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
import { isValid as isValidDate } from 'date-fns'
import { SerializedStatus } from '../../interfaces/db/status'
import { isArray } from 'lodash'
import { SerializedUserTeamPermissions } from '../../interfaces/db/userTeamPermissions'
import { SerializedDocWithSupplemental } from '../../interfaces/db/doc'
export interface ViewTableData {
  columns: Record<string, Column>
  sort?: ViewTableSortingOptions
  filter?: SerializedQuery
  titleColumnWidth?: number
}

export interface ViewTableColumnSortingOption {
  type: 'column'
  columnType: string
  columnName: string
  direction: 'asc' | 'desc'
}

export interface ViewTableStaticPropSortingOption {
  type: 'static-prop'
  propertyName: 'creation_date' | 'update_date' | 'label' | 'title'
  direction: 'asc' | 'desc'
}

export type ViewTableSortingOptions =
  | ViewTableStaticPropSortingOption
  | ViewTableColumnSortingOption

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
  width?: number
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
      sort: {
        type: 'static-prop',
        propertyName: 'creation_date',
        direction: 'asc',
      },
    },
  } as SerializedView<ViewTableData>
}

export function sortDocsBySortOption(
  sort: unknown,
  permissions: SerializedUserTeamPermissions[],
  docs: SerializedDocWithSupplemental[]
) {
  const normalizedSort = normalizeTableViewSortingOption(sort)
  const comparator = selectComparatorFromTableViewSortOption(normalizedSort)

  const comparableList = docs.map((doc) => {
    return mapComparableItem(normalizedSort, permissions, doc)
  })

  return sortByComparator(comparableList, comparator)
}

export function normalizeTableViewSortingOption(sort: unknown) {
  const defaultSort: ViewTableStaticPropSortingOption = {
    type: 'static-prop',
    propertyName: 'creation_date',
    direction: 'asc',
  }

  if (sort == null) {
    return defaultSort
  }
  switch ((sort as ViewTableSortingOptions).type) {
    case 'static-prop':
      const staticPropSort = sort as ViewTableStaticPropSortingOption
      switch (staticPropSort.propertyName) {
        case 'title':
        case 'label':
        case 'creation_date':
        case 'update_date':
          const direction = staticPropSort.direction !== 'desc' ? 'asc' : 'desc'

          return {
            type: 'static-prop',
            propertyName: staticPropSort.propertyName,
            direction,
          } as ViewTableStaticPropSortingOption
        default:
          return defaultSort
      }
    case 'column':
      const columnSort = sort as ViewTableColumnSortingOption
      const direction = columnSort.direction !== 'desc' ? 'asc' : 'desc'
      if (columnSort.columnType == null || columnSort.columnName == null) {
        return defaultSort
      }
      return {
        type: 'column',
        direction,
        columnName: columnSort.columnName,
        columnType: columnSort.columnType,
      } as ViewTableColumnSortingOption
    default:
      return defaultSort
  }
}

export function selectComparatorFromTableViewSortOption(
  sort: ViewTableSortingOptions
): (a: any, b: any) => number {
  if (
    (sort.type === 'column' &&
      (sort.columnType === 'number' || sort.columnType === 'date')) ||
    (sort.type === 'static-prop' &&
      (sort.propertyName === 'creation_date' ||
        sort.propertyName === 'update_date'))
  ) {
    return (a: any, b: any) => (sort.direction === 'desc' ? b - a : a - b)
  } else {
    return (a: string, b: string) => {
      const compareResult = a.localeCompare(b)

      return sort.direction === 'desc' ? -compareResult : compareResult
    }
  }
}

export interface ComprableItem {
  doc: SerializedDocWithSupplemental
  compareValue: string | number | Date | null // null means invalid
}

function getNullIfEmptyString(value: string) {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function mapComparableItem(
  sort: ViewTableSortingOptions,
  permissions: SerializedUserTeamPermissions[],
  doc: SerializedDocWithSupplemental
): ComprableItem {
  switch (sort.type) {
    case 'static-prop':
      switch (sort.propertyName) {
        case 'title':
          return {
            doc,
            compareValue: getNullIfEmptyString(doc.title),
          }
        case 'label':
          const tags = doc.tags.slice().sort((tagA, tagB) => {
            const tagCompareResult = tagA.text.localeCompare(tagB.text)
            return sort.direction === 'asc'
              ? tagCompareResult
              : -tagCompareResult
          })

          return {
            doc,
            compareValue: getNullIfEmptyString(
              tags.map((tag) => tag.text.trim()).join(' ')
            ),
          }
        case 'update_date':
          const updatedAt = new Date(doc.updatedAt)
          return {
            doc,
            compareValue: isValidDate(updatedAt) ? updatedAt : null,
          }
        default:
        case 'creation_date':
          const createdAt = new Date(doc.createdAt)
          return {
            doc,
            compareValue: isValidDate(createdAt) ? createdAt : null,
          }
      }
    case 'column':
      const docProp = doc.props[sort.columnName]
      if (docProp == null) {
        return {
          doc,
          compareValue: null,
        }
      }
      switch (sort.columnType) {
        case 'string': {
          const compareValue = isArray(docProp.data)
            ? docProp.data[0]
            : docProp.data
          return {
            doc,
            compareValue:
              typeof compareValue === 'string'
                ? getNullIfEmptyString(compareValue)
                : null,
          }
        }
        case 'date': {
          const rawCompareValue = isArray(docProp.data)
            ? docProp.data[0]
            : docProp.data
          if (rawCompareValue == null) {
            return {
              doc,
              compareValue: null,
            }
          }
          const compareValue = new Date(rawCompareValue)
          return {
            doc,
            compareValue: isValidDate(compareValue) ? compareValue : null,
          }
        }
        case 'json':
          return {
            doc,
            compareValue:
              docProp.data != null ? JSON.stringify(docProp.data) : null,
          }
        case 'number': {
          const compareValue = isArray(docProp.data)
            ? docProp.data[0]
            : docProp.data
          return {
            doc,
            compareValue:
              typeof compareValue === 'number' ? compareValue : null,
          }
        }
        case 'user':
          let compareValue = null
          if (isArray(docProp.data)) {
            const validPermissions = docProp.data
              .map((assignedPermission) => {
                return permissions.find(
                  (permission) =>
                    permission.userId === (assignedPermission as any)?.userId
                )
              })
              .filter(
                (permission): permission is SerializedUserTeamPermissions =>
                  permission != null
              )
            validPermissions.sort((permissionA, permissionB) => {
              const userADisplayName = permissionA.user.displayName.trim()
              const userBDisplayName = permissionB.user.displayName.trim()
              return userADisplayName.localeCompare(userBDisplayName)
            })

            if (sort.direction === 'desc') {
              validPermissions.reverse()
            }
            compareValue = getNullIfEmptyString(
              validPermissions
                .map((permission) => permission.user.displayName.trim())
                .join(' ')
            )
          } else {
            const targetPermission = permissions.find(
              (permission) => permission.userId === docProp.data?.userId
            )

            compareValue =
              targetPermission != null
                ? targetPermission.user.displayName.trim()
                : null
          }

          return {
            doc,
            compareValue,
          }
        case 'status': {
          let compareValue = null
          if (isArray(docProp.data)) {
            const statusNames = docProp.data
              .map((mayBeStatus) => {
                return (mayBeStatus as SerializedStatus)?.name
              })
              .filter((name): name is string => typeof name === 'string')

            statusNames.sort((nameA, nameB) => {
              return nameA.trim().localeCompare(nameB.trim())
            })

            if (sort.direction === 'desc') {
              statusNames.reverse()
            }

            compareValue = getNullIfEmptyString(
              statusNames.map((name) => name.trim()).join(' ')
            )
          } else {
            compareValue =
              typeof docProp.data?.name === 'string'
                ? getNullIfEmptyString(docProp.data?.name.trim())
                : null
          }

          return {
            doc,
            compareValue,
          }
        }
      }

      const createdAt = new Date(doc.createdAt)
      return {
        doc,
        compareValue: isValidDate(createdAt) ? createdAt : null,
      }
  }
}

/**
 * Valid data(ASC/DESC) -> Invalid data(sorted by createdAt / Always ASC)
 */
export function sortByComparator(
  list: ComprableItem[],
  comparator: (a: any, b: any) => number
): SerializedDocWithSupplemental[] {
  return list
    .slice()
    .sort((a, b) => {
      if (a.compareValue == null && b.compareValue == null) {
        return a.doc.createdAt.localeCompare(b.doc.createdAt)
      } else if (a.compareValue == null && b.compareValue != null) {
        return 1
      } else if (a.compareValue != null && b.compareValue == null) {
        return -1
      }
      const compareResult = comparator(a.compareValue, b.compareValue)
      if (compareResult === 0) {
        return a.doc.createdAt.localeCompare(b.doc.createdAt)
      }
      return compareResult
    })
    .map((comparableItem) => comparableItem.doc)
}
