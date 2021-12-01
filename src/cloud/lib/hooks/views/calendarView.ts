import { useEffect, useRef } from 'react'
import { SerializedView } from '../../../interfaces/db/view'
import { useCloudApi } from '../useCloudApi'

interface CalendarViewStoreProps {
  view: SerializedView
}

export type CalendarViewActionsRef = React.MutableRefObject<{}>

export function useCalendarView({ view }: CalendarViewStoreProps) {
  const { updateViewApi, createViewApi, sendingMap } = useCloudApi()

  const actionsRef: CalendarViewActionsRef = useRef({})

  useEffect(() => {
    actionsRef.current = {}
  }, [])

  return {
    actionsRef,
    sending: sendingMap.get(view.id.toString()),
  }
}
