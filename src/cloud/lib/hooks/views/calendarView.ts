import { useCallback, useEffect, useRef } from 'react'
import { BulkApiActionRes } from '../../../../design/lib/hooks/useBulkApi'
import { SerializedDocWithSupplemental } from '../../../interfaces/db/doc'
import { PropType } from '../../../interfaces/db/props'
import { SerializedView } from '../../../interfaces/db/view'
import { ViewCalendarData } from '../../views/calendar'
import { useCloudApi } from '../useCloudApi'

interface CalendarViewStoreProps {
  view: SerializedView
}

export type CalendarViewActionsRef = React.MutableRefObject<{
  updateWatchedProp: (newProp: {
    type: PropType
    name: string
  }) => Promise<BulkApiActionRes | undefined>
  updateDocDate: (
    doc: SerializedDocWithSupplemental,
    dateRange: Date[]
  ) => Promise<BulkApiActionRes | undefined>
}>

export function useCalendarView({ view }: CalendarViewStoreProps) {
  const { sendingMap, updateViewApi, updateDocPropsApi } = useCloudApi()

  const updateWatchedProp = useCallback(
    async (newProp: { type: PropType; name: string }) => {
      if (newProp.type !== 'date') {
        return
      }

      return updateViewApi(view, {
        data: { ...view.data, watchedProp: newProp },
      })
    },
    [view, updateViewApi]
  )

  const updateDocDate = useCallback(
    async (doc: SerializedDocWithSupplemental, dateRange: Date[]) => {
      if (dateRange.length > 2) {
        return
      }

      const prop = (view.data as ViewCalendarData).watchedProp || {
        type: 'date',
        name: 'Date',
      }

      return updateDocPropsApi(doc, [
        prop.name,
        {
          type: 'date',
          data: dateRange.length === 1 ? dateRange[0] : dateRange,
        },
      ])
    },
    [view, updateDocPropsApi]
  )

  const actionsRef: CalendarViewActionsRef = useRef({
    updateWatchedProp,
    updateDocDate,
  })

  useEffect(() => {
    actionsRef.current = {
      updateWatchedProp,
      updateDocDate,
    }
  }, [updateWatchedProp, updateDocDate])

  return {
    actionsRef,
    viewSendingState: sendingMap.get(view.id.toString()),
    sendingMap,
    watchedProp: (view.data as ViewCalendarData).watchedProp || {
      type: 'date',
      name: 'Date',
    },
  }
}
