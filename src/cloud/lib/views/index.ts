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
