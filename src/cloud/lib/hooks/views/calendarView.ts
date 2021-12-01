import { useCallback, useEffect, useRef } from 'react'
import { BulkApiActionRes } from '../../../../design/lib/hooks/useBulkApi'
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

  const actionsRef: CalendarViewActionsRef = useRef({
    updateWatchedProp,
  })

  useEffect(() => {
    actionsRef.current = {
      updateWatchedProp,
    }
  }, [updateWatchedProp])

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
