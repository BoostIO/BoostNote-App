import { useCallback, useEffect, useRef } from 'react'
import { BulkApiActionRes } from '../../../../design/lib/hooks/useBulkApi'
import { SerializedDocWithSupplemental } from '../../../interfaces/db/doc'
import { PropType } from '../../../interfaces/db/props'
import { SerializedQuery } from '../../../interfaces/db/smartView'
import { SerializedView } from '../../../interfaces/db/view'
import { getArrayFromRecord } from '../../utils/array'
import { CalendarViewProp, ViewCalendarData } from '../../views/calendar'
import { useCloudApi } from '../useCloudApi'

interface CalendarViewStoreProps {
  view: SerializedView<ViewCalendarData>
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
  addProperty: (
    newProp: CalendarViewProp
  ) => Promise<BulkApiActionRes | undefined>
  removeProperty: (id: string) => Promise<BulkApiActionRes | undefined>
  setViewProperties: (
    props: Record<string, CalendarViewProp>
  ) => Promise<BulkApiActionRes | undefined>
  setFilters: (filters: SerializedQuery) => Promise<BulkApiActionRes>
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

  const setViewProperties = useCallback(
    async (props: Record<string, CalendarViewProp>) => {
      return updateViewApi(view, {
        data: { ...view.data, props },
      })
    },
    [view, updateViewApi]
  )

  const addProperty = useCallback(
    async (newProp: CalendarViewProp) => {
      const properties = view.data.props || {}
      if (
        getArrayFromRecord(properties).some((val) => val.name === newProp.name)
      ) {
        return
      }

      return updateViewApi(view, {
        data: { ...view.data, props: { ...properties, [newProp.id]: newProp } },
      })
    },
    [view, updateViewApi]
  )

  const removeProperty = useCallback(
    async (id: string) => {
      const properties = view.data.props || {}
      if (!Object.keys(properties).some((propertyId) => propertyId === id)) {
        return
      }

      const newProps = { ...properties }
      delete newProps[id]

      return updateViewApi(view, {
        data: { ...view.data, props: newProps },
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

  const setFilters = useCallback(
    (filters: SerializedQuery) => {
      return updateViewApi(view, {
        data: { ...view.data, filter: filters as SerializedQuery },
      })
    },
    [updateViewApi, view]
  )

  const actionsRef: CalendarViewActionsRef = useRef({
    updateWatchedProp,
    updateDocDate,
    addProperty,
    removeProperty,
    setViewProperties,
    setFilters,
  })

  useEffect(() => {
    actionsRef.current = {
      updateWatchedProp,
      updateDocDate,
      addProperty,
      removeProperty,
      setViewProperties,
      setFilters,
    }
  }, [
    updateWatchedProp,
    updateDocDate,
    addProperty,
    removeProperty,
    setViewProperties,
    setFilters,
  ])

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
