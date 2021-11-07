import {
  mdiAccountCheckOutline,
  mdiAccountOutline,
  mdiArrowDownDropCircleOutline,
  mdiCalendarMonthOutline,
  mdiCheckAll,
  mdiLabelOutline,
  mdiTimerOutline,
  mdiTimerSandEmpty,
} from '@mdi/js'
import { capitalize } from 'lodash'
import {
  FilledSerializedPropData,
  SerializedPropData,
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
    case 'dueDate':
      return mdiCheckAll
    case 'startDate':
      return mdiCalendarMonthOutline
    case 'timeEstimate':
      return mdiTimerSandEmpty
    case 'timeTracked':
      return mdiTimerOutline
    case 'status':
      return mdiArrowDownDropCircleOutline
    case 'reviewers':
      return mdiAccountCheckOutline
    case 'assignees':
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
