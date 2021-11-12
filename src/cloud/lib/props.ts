import {
  mdiAccountCheckOutline,
  mdiAccountOutline,
  mdiArrowDownDropCircleOutline,
  mdiCalendarMonthOutline,
  mdiCheckAll,
  mdiClockOutline,
  mdiContentSaveOutline,
  mdiLabelOutline,
  mdiTimerOutline,
  mdiTimerSandEmpty,
} from '@mdi/js'
import { capitalize } from 'lodash'
import {
  FilledSerializedPropData,
  PropSubType,
  PropType,
  SerializedPropData,
  StaticPropType,
} from '../interfaces/db/props'

export const supportedPropertyNames = [
  'assignees',
  'dueDate',
  'reviewers',
  'startDate',
  'status',
  'timeEstimate',
  'timeTracked',
]

export const supportedPropTypes: {
  type: PropType
  subType?: PropSubType
}[] = [
  { type: 'date' },
  { type: 'json', subType: 'timeperiod' },
  { type: 'string' },
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
    case 'string':
      return 'Status'
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

export function getLabelOfProp(propName: string): string {
  switch (propName) {
    case 'created_date':
      return 'Created date'
    case 'updated_date':
      return 'Updated date'
    case 'dueDate':
      return 'Due Date'
    case 'startDate':
      return 'Start Date'
    case 'timeEstimate':
      return 'Time Estimate'
    case 'timeTracked':
      return 'Time Tracked'
    case 'status':
    case 'reviewers':
    case 'assignees':
    default:
      return capitalize(propName)
  }
}

export function getIconPathOfProp(propName: string): string | undefined {
  switch (propName) {
    case 'created_date':
      return mdiClockOutline
    case 'updated_date':
      return mdiContentSaveOutline
    case 'dueDate':
      return mdiCheckAll
    case 'startDate':
    case 'date':
      return mdiCalendarMonthOutline
    case 'timeEstimate':
      return mdiTimerSandEmpty
    case 'timeTracked':
    case 'time':
      return mdiTimerOutline
    case 'status':
      return mdiArrowDownDropCircleOutline
    case 'reviewers':
      return mdiAccountCheckOutline
    case 'assignees':
    case 'person':
      return mdiAccountOutline
    case 'label':
      return mdiLabelOutline
    default:
      return
  }
}

export function getInitialPropDataOfProp(propName: string): SerializedPropData {
  switch (propName) {
    case 'dueDate':
    case 'startDate':
      return { type: 'date', data: undefined, createdAt: new Date().toString() }
    case 'timeEstimate':
    case 'timeTracked':
      return {
        type: 'json',
        data: { dataType: 'timeperiod', data: null },
        createdAt: new Date().toString(),
      }
    case 'reviewers':
    case 'assignees':
      return { type: 'user', data: undefined, createdAt: new Date().toString() }
    case 'status':
    default:
      return {
        type: 'string',
        data: undefined,
        createdAt: new Date().toString(),
      }
  }
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
  string: ['Status', 'Text'],
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
    case 'string':
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
    case 'string':
    default:
      return {
        type: 'string',
        data: undefined,
        createdAt: new Date().toString(),
      }
  }
}
