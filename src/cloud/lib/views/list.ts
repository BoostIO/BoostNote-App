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
  props?: Record<string, ListViewProp>
}

export function makeListViewPropId(
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

export function getGeneratedIdFromListViewPropId(propId: string) {
  return propId.split(':').shift()
}

export function getPropTypeFromListViewPropId(propId: string) {
  return propId.split(':').pop() as PropSubType | PropType
}

export interface StaticProp {
  prop: StaticPropType
}

export interface Prop {
  type: PropType
  subType?: PropSubType
}

export type ListViewProp = {
  id: string
  name: string
  order: string
} & (Prop | StaticProp)

export function isListViewProperty(item: any): item is ListViewProp {
  return isListViewStaticProp(item) || isListViewProp(item)
}

export function isListViewProp(item: any): item is Prop {
  return item != null && typeof item.type === 'string'
}

export function isListViewStaticProp(item: any): item is StaticProp {
  return item != null && typeof item.prop === 'string'
}

export function isViewListData(data: any): data is ViewListData {
  return data.props != null && Object.values(data.props).every(isString)
}

export function getInsertionOrderForListViewProp(
  props: Record<string, ListViewProp> = {}
) {
  const propValues =
    Object.keys(props).length === 0
      ? []
      : sortByAttributeAsc('order', Object.values(props))
  if (propValues.length === 0) {
    return LexoRank.middle().toString()
  } else {
    return LexoRank.max()
      .between(LexoRank.parse(propValues[propValues.length - 1].order))
      .toString()
  }
}

export function sortListViewProps(
  props: Record<string, ListViewProp> = {}
): ListViewProp[] {
  if (Object.keys(props).length === 0) {
    return []
  }

  Object.keys(props).forEach((key) => {
    if (props[key].order == null) {
      props[key].order = LexoRank.middle().toString()
    }
  })

  return sortByAttributeAsc('order', getArrayFromRecord(props))
}

export function getDefaultListView(
  parent: ViewParent
): SerializedView<ViewListData> {
  const labelPropId = makeListViewPropId('Label', 'label')
  return {
    id: -1,
    shortId: '-1',
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
