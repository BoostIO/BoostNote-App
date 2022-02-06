import {
  mdiAccountOutline,
  mdiArrowDownDropCircleOutline,
  mdiCalendarMonthOutline,
  mdiClockOutline,
  mdiContentSaveOutline,
  mdiFormatText,
  mdiLabelOutline,
  mdiLinkVariant,
  mdiMusicAccidentalSharp,
  mdiSwapHorizontal,
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

export function isPropType(x: any): x is PropType {
  if (typeof x !== 'string') {
    return false
  }

  return supportedPropTypes.some(({ type }) => (type as string) === x)
}

export const supportedPropTypes: {
  type: PropType
  subType?: PropSubType
}[] = [
  { type: 'date' },
  { type: 'number', subType: 'timeperiod' },
  { type: 'status' },
  { type: 'user' },
  { type: 'number' },
  { type: 'string' },
  { type: 'string', subType: 'url' },
  { type: 'compound', subType: 'dependency' },
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
    case 'string':
      return 'Text'
    case 'dependency':
      return 'Dependencies'
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
    case 'url':
      return mdiLinkVariant
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
    case 'number':
      return mdiMusicAccidentalSharp
    case 'string':
      return mdiFormatText
    case 'dependency':
      return mdiSwapHorizontal
    default:
      return
  }
}

export function getInitialPropDataOfPropType(
  type: PropType | PropSubType
): SerializedPropData {
  switch (type) {
    case 'dependency':
      return {
        type: 'compound',
        subType: 'dependency',
        createdAt: new Date().toString(),
        data: undefined,
      }
    case 'date':
      return { type: 'date', data: undefined, createdAt: new Date().toString() }
    case 'timeperiod':
      return {
        type: 'number',
        subType: 'timeperiod',
        data: null,
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
    case 'number':
      return {
        type: 'number',
        data: undefined,
        createdAt: new Date().toString(),
      }
    case 'url':
      return {
        type: 'string',
        subType: 'url',
        data: '',
        createdAt: new Date().toString(),
      }
    case 'string':
    default:
      return {
        type: 'string',
        data: '',
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
      case 'compound':
        const copyData = Object.assign({}, propData)
        Object.entries(copyData).forEach(([key, value]) => {
          if (key == null) {
            return
          }
          switch (key) {
            case 'targetDoc': {
              const val = Array.isArray(value) ? value : [value]
              if (!isUUIDArray(value)) {
                copyData[key] = val
                  .filter((doc: any) => doc != null)
                  .map((doc: any) => doc.id)
              }
              return
            }
            case 'member': {
              const val = Array.isArray(value) ? value : [value]
              if (!isUUIDArray(value)) {
                copyData[key] = val
                  .filter((user: any) => user != null)
                  .map((user: any) => user.userId)
              }
              return
            }
            case 'status': {
              const val = Array.isArray(value) ? value : [value]
              if (!isUUIDArray(value)) {
                copyData[key] = val
                  .filter((status: any) => status != null)
                  .map((status: any) => status.id)
              }
              return
            }
          }
        })
        break
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
    return { type: data.type, subType: data.subType, data: propData }
  }

  return { type: data.type, subType: data.subType, data: null }
}

export function getDefaultStaticSuggestionsPerType(): {
  type: StaticPropType
  name: string
}[] {
  return [
    { type: 'label', name: 'Label' },
    { type: 'creation_date', name: 'Creation Date' },
    { type: 'update_date', name: 'Update Date' },
  ]
}

export function getDefaultColumnSuggestionsPerType(): {
  type: PropType
  subType?: PropSubType
  name: string
}[] {
  return [
    { type: 'user', name: 'Assignees' },
    { type: 'user', name: 'Reviewers' },
    { type: 'number', subType: 'timeperiod', name: 'Time Estimate' },
    { type: 'number', subType: 'timeperiod', name: 'Time Tracked' },
    { type: 'status', name: 'Status' },
    { type: 'date', name: 'Due Date' },
    { type: 'date', name: 'Start Date' },
    { type: 'number', name: 'Story Point' },
    { type: 'string', name: 'Text' },
    { type: 'string', subType: 'url', name: 'Url' },
    { type: 'compound', subType: 'dependency', name: 'Dependencies' },
  ]
}
