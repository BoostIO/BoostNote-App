import { mdiCalendarMonthOutline, mdiTable, mdiViewWeek } from '@mdi/js'
import { SupportedViewTypes } from '../../interfaces/db/view'

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
    default:
    case 'table':
      return mdiTable
  }
}
