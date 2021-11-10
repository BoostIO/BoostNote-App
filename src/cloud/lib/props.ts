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
  SerializedPropData,
} from '../interfaces/db/props'

export const ConditionNameSuggestionsPerTypeOrSubType: Record<
  string,
  string[]
> = {
  user: ['Assignees', 'Reviewers'],
  timeperiod: ['Time Estimate', 'Time Tracked'],
  date: ['Due Date', 'Start Date'],
  status: ['Status'],
}

export const supportedPropertyNames = [
  'assignees',
  'dueDate',
  'reviewers',
  'startDate',
  'status',
  'timeEstimate',
  'timeTracked',
]

export function getPropsOfItem(
  props: Record<string, SerializedPropData & { createdAt: string }>
) {
  const properties: Record<
    string,
    { name: string; data: SerializedPropData & { createdAt: string } }
  > = {}

  Object.entries(props).forEach((prop) => {
    if (!supportedPropertyNames.includes(prop[0])) {
      return
    }

    properties[getLabelOfProp(prop[0])] = { name: prop[0], data: prop[1] }
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
