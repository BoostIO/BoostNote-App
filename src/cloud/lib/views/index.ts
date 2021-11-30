import {
  mdiCalendarMonthOutline,
  mdiTable,
  mdiViewParallelOutline,
} from '@mdi/js'
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
      return mdiViewParallelOutline
    default:
    case 'table':
      return mdiTable
  }
}
