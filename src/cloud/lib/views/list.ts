import { generate } from 'shortid'
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

export interface ViewListData {
  props?: Record<string, Props>
}

export function makeListPropId(
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

export function getGeneratedIdFromPropId(colId: string) {
  return colId.split(':').shift()
}

export function getPropTypeFromPropId(colId: string) {
  return colId.split(':').pop() as PropSubType | PropType
}

export interface StaticProp {
  prop: StaticPropType
}

export interface Prop {
  type: PropType
  subType?: PropSubType
}

export type Props = {
  id: string
  name: string
  order: string
} & (Prop | StaticProp)

export function isProps(item: any): item is Props {
  return isStaticProp(item) || isProp(item)
}

export function isProp(item: any): item is Prop {
  return item != null && typeof item.type === 'string'
}

export function isStaticProp(item: any): item is StaticProp {
  return item != null && typeof item.prop === 'string'
}

export function isViewListData(data: any): data is ViewListData {
  return data.props != null && Object.values(data.props).every(isString)
}

export function getInsertedPropsOrder(columns: Record<string, Props> = {}) {
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

export function sortListViewPropss(
  columns: Record<string, Props> = {}
): Props[] {
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

export function getDefaultListView(
  parent: ViewParent
): SerializedView<ViewListData> {
  const labelPropId = makeListPropId('Label', 'label')
  return {
    id: -1,
    workspace: parent.type === 'workspace' ? parent.target : undefined,
    workspaceId: parent.type === 'workspace' ? parent.target.id : undefined,
    folder: parent.type === 'folder' ? parent.target : undefined,
    folderId: parent.type === 'folder' ? parent.target.id : undefined,
    smartView: parent.type === 'smartView' ? parent.target : undefined,
    smartViewId: parent.type === 'smartView' ? parent.target.id : undefined,
    type: 'list',
    name: 'List',
    data: {
      props: {
        [labelPropId]: {
          id: labelPropId,
          prop: 'label',
          name: 'Label',
          order: LexoRank.min().between(LexoRank.middle()).toString(),
        },
      },
    },
  } as SerializedView<ViewListData>
}

export function isDefaultView(view: SerializedView<any>) {
  return view.id === -1
}
