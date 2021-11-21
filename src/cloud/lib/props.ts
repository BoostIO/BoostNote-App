import {
  mdiAccountOutline,
  mdiArrowDownDropCircleOutline,
  mdiCalendarMonthOutline,
  mdiClockOutline,
  mdiContentSaveOutline,
  mdiLabelOutline,
  mdiTimerOutline,
} from '@mdi/js'
import { capitalize, isNumber, isObject } from 'lodash'
import {
  FilledSerializedPropData,
  PropSubType,
  PropType,
  SerializedPropData,
  StaticPropType,
} from '../interfaces/db/props'
import { isUUIDArray } from './utils/array'

export const supportedPropTypes: {
  type: PropType
  subType?: PropSubType
}[] = [
  { type: 'date' },
  { type: 'json', subType: 'timeperiod' },
  { type: 'status' },
  { type: 'user' },
]

export function getLabelOfPropType(
  propType: PropType | StaticPropType | PropSubType
): string {
  switch (propType) {
    case 'timeperiod':
      return 'Time'
    case 'user':
      return 'Person'
    case 'creation_date':
      return 'Creation Date'
    case 'update_date':
      return 'Update Date'
    default:
      return capitalize(propType)
  }
}

export function getPropsOfItem(
  props: Record<string, SerializedPropData & { createdAt: string }>
) {
  const properties: Record<
    string,
    { name: string; data: SerializedPropData & { createdAt: string } }
  > = {}

  Object.entries(props).forEach((prop) => {
    properties[prop[0]] = { name: prop[0], data: prop[1] }
  })

  return properties
}

export function isPropFilled(
  x: SerializedPropData
): x is FilledSerializedPropData {
  if (x.data == null) {
    return false
  }

  return true
}

/// ### NEW CONVENTIONS

export const ConditionNameSuggestionsPerTypeOrSubType: Record<
  string,
  string[]
> = {
  user: ['Assignees', 'Reviewers'],
  timeperiod: ['Time Estimate', 'Time Tracked'],
  date: ['Due Date', 'Start Date'],
  status: ['Status'],
  number: ['Number'],
}

export function getIconPathOfPropType(
  type: PropType | StaticPropType | PropSubType
): string | undefined {
  switch (type) {
    case 'creation_date':
      return mdiClockOutline
    case 'update_date':
      return mdiContentSaveOutline
    case 'date':
      return mdiCalendarMonthOutline
    case 'timeperiod':
      return mdiTimerOutline
    case 'user':
      return mdiAccountOutline
    case 'label':
      return mdiLabelOutline
    case 'status':
      return mdiArrowDownDropCircleOutline
    default:
      return
  }
}

export function getInitialPropDataOfPropType(
  type: PropType | PropSubType
): SerializedPropData {
  switch (type) {
    case 'date':
      return { type: 'date', data: undefined, createdAt: new Date().toString() }
    case 'timeperiod':
      return {
        type: 'json',
        data: { dataType: 'timeperiod', data: null },
        createdAt: new Date().toString(),
      }
    case 'user':
      return { type: 'user', data: undefined, createdAt: new Date().toString() }
    case 'status':
      return {
        type: 'status',
        data: undefined,
        createdAt: new Date().toString(),
      }
    case 'string':
    default:
      return {
        type: 'string',
        data: undefined,
        createdAt: new Date().toString(),
      }
  }
}

export function getDomainOrInitialDataPropToPropData(
  data: SerializedPropData
): Omit<SerializedPropData, 'createdAt'> {
  let propData = data.data
  if (data.data != null) {
    switch (data.type) {
      case 'user':
        const users = Array.isArray(data.data) ? data.data : [data.data]
        if (!isUUIDArray(users)) {
          propData = users
            .filter((user) => user != null)
            .map((user: any) => user.userId)
        }
        break
      case 'status':
        const statuses = Array.isArray(data.data) ? data.data : [data.data]
        if (!statuses.every((status) => isNumber(status))) {
          propData = statuses
            .filter((status) => status != null)
            .map((status: any) => status.id)
        }
        break
      default:
        break
    }
  }

  if (isObject(propData)) {
    return { type: data.type, data: propData }
  }

  return { type: data.type, data: null }
}
