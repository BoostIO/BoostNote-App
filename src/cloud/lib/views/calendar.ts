import {
  PropSubType,
  PropType,
  StaticPropType,
} from '../../interfaces/db/props'
import { LexoRank } from 'lexorank'
import { sortByAttributeAsc } from '../../../design/lib/utils/array'
import { getArrayFromRecord } from '../utils/array'
import { generate } from 'shortid'

export interface ViewCalendarData {
  watchedProp?: { type: PropType; name: string }
  props?: Record<string, CalendarViewProp>
}

export interface CalendarStaticProp {
  prop: StaticPropType
}

export interface CalendarProp {
  type: PropType
  subType?: PropSubType
}

export type CalendarViewProp = {
  id: string
  name: string
  order: string
} & (CalendarStaticProp | CalendarProp)

export function isCalendarProperty(item: any): item is CalendarViewProp {
  return isCalendarStaticProp(item) || isCalendarProp(item)
}

export function isCalendarProp(item: any): item is CalendarProp {
  return item != null && typeof item.type === 'string'
}

export function isCalendarStaticProp(item: any): item is CalendarStaticProp {
  return item != null && typeof item.prop === 'string'
}

export function getInsertionOrderForProperty(
  properties: Record<string, CalendarViewProp> = {}
) {
  const sortedValues = sortCalendarViewProps(properties)
  if (sortedValues.length === 0) {
    return LexoRank.middle().toString()
  }
  return LexoRank.max()
    .between(LexoRank.parse(sortedValues[sortedValues.length - 1].order))
    .toString()
}

/** beforeColumnId == null eq insertion in last place **/
export function getColumnOrderAfterMove(
  properties: Record<string, CalendarViewProp> = {},
  movedColumnId: string,
  beforeColumnId?: string
): string | undefined {
  if (beforeColumnId == null) {
    return getInsertionOrderForProperty(properties)
  }

  const sortedProperties = sortCalendarViewProps(properties)
  const movedColumnIndex = sortedProperties.findIndex(
    (col) => col.id === movedColumnId
  )
  if (sortedProperties.length === 0 || movedColumnIndex === -1) {
    return
  }

  switch (movedColumnIndex) {
    case 0:
      return sortedProperties[movedColumnIndex].order
    case 1:
      return LexoRank.min()
        .between(LexoRank.parse(sortedProperties[movedColumnIndex - 1].order))
        .toString()
    default:
      return LexoRank.parse(sortedProperties[movedColumnIndex - 2].order)
        .between(LexoRank.parse(sortedProperties[movedColumnIndex - 1].order))
        .toString()
  }
}

export function sortCalendarViewProps(
  properties: Record<string, CalendarViewProp> = {}
): CalendarViewProp[] {
  if (Object.keys(properties).length === 0) {
    return []
  }

  Object.keys(properties).forEach((key) => {
    if (properties[key].order == null) {
      properties[key].order = LexoRank.middle().toString()
    }
  })

  return sortByAttributeAsc('order', getArrayFromRecord(properties))
}

export function makeCalendarPropId(
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

export function getGeneratedIdFromCalendarPropId(colId: string) {
  return colId.split(':').shift()
}

export function getPropTypeFromCalendarId(colId: string) {
  return colId.split(':').pop() as PropSubType | PropType
}
