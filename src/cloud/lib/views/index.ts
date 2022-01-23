import {
  mdiCalendarMonthOutline,
  mdiFormatListBulleted,
  mdiTable,
  mdiViewWeek,
} from '@mdi/js'
import { SerializedView, SupportedViewTypes } from '../../interfaces/db/view'

export type ViewMoveType =
  | 'before'
  | 'after'
  | {
      target: number
      type: 'before' | 'after'
    }

export function getIconPathOfViewType(type: SupportedViewTypes) {
  switch (type) {
    case 'calendar':
      return mdiCalendarMonthOutline
    case 'kanban':
      return mdiViewWeek
    case 'table':
      return mdiTable
    case 'list':
    default:
      return mdiFormatListBulleted
  }
}

export function isDefaultView(view: SerializedView<any>) {
  return view.id === -1
}

export function getDescriptionOfViewType(type: SupportedViewTypes) {
  switch (type) {
    case 'calendar':
      return 'Displays your documents in a monthly view to observe their progress.'
    case 'kanban':
      return "Creates a ticket board allowing you to easily track your docs' statuses."
    case 'table':
      return 'Creates a table that can be tailored to your needs and making full use of properties.'
    case 'list':
    default:
      return 'Provides a simple and clean interface to see your documents.'
  }
}

export function getDefaultViewShortId() {
  return '-1'
}
