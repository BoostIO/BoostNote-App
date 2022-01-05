import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SupportedViewTypes } from '../../../interfaces/db/view'
import { useCloudApi } from '../useCloudApi'
import { SerializedDashboard } from '../../../interfaces/db/dashboard'
import { SerializedTeam } from '../../../interfaces/db/team'
import { useNav } from '../../stores/nav'
import { getMapValues } from '../../../../design/lib/utils/array'
import {
  SerializedQuery,
  SerializedSmartView,
} from '../../../interfaces/db/smartView'
import { BulkApiActionRes } from '../../../../design/lib/hooks/useBulkApi'
import { Layout } from 'react-grid-layout'
import { isEqual, pick } from 'lodash'
import {
  UpdateSmartViewRequestBody,
  UpdateSmartViewResponseBody,
} from '../../../api/teams/smartViews'

interface DashboardStoreProps {
  dashboard: SerializedDashboard
  smartViews: SerializedSmartView[]
  team: SerializedTeam
}

export type DashboardActionsRef = React.MutableRefObject<{
  addSmartView: (body: {
    name: string
    condition: SerializedQuery
    view: SupportedViewTypes
  }) => Promise<BulkApiActionRes>
  updateSmartView: (
    smartView: SerializedSmartView,
    body: UpdateSmartViewRequestBody
  ) => Promise<BulkApiActionRes>
  removeSmartView: (smartView: SerializedSmartView) => Promise<BulkApiActionRes>
  removeDashboard: () => Promise<BulkApiActionRes>
  updateDashboardLayout: (layouts: Layout[]) => void
}>

export function useDashboard({
  dashboard: initialDashboard,
  smartViews: initialSmartViews,
  team,
}: DashboardStoreProps) {
  const dashboardRef = useRef(initialDashboard.id)
  const [smartViews, setSmartViews] = useState(initialSmartViews)
  const [dashboardData, setDashboardData] = useState(
    initialDashboard.data || {}
  )
  const { dashboardsMap, updateViewsMap } = useNav()
  const {
    createSmartViewApi,
    deleteDashboard,
    deleteSmartViewApi,
    updateDashboard,
    updateSmartViewApi,
    sendingMap,
  } = useCloudApi()

  useEffect(() => {
    if (initialDashboard.id !== dashboardRef.current) {
      dashboardRef.current = initialDashboard.id
      setSmartViews(initialSmartViews)
      setDashboardData(initialDashboard.data || {})
    }
  }, [initialDashboard, initialSmartViews])

  const dashboard = useMemo(() => {
    return getMapValues(dashboardsMap).find(
      (val) => val.id === initialDashboard.id
    )
  }, [initialDashboard.id, dashboardsMap])

  const updateDashboardLayout = useCallback(
    (layouts: Layout[]) => {
      const cleanedLayouts = cleanupLayouts(layouts)
      if (!isEqual(dashboardData.itemsLayouts, cleanedLayouts)) {
        const newData = { ...dashboardData, itemsLayouts: cleanedLayouts }
        setDashboardData(newData)
        updateDashboard(initialDashboard, {
          data: newData,
        })
      }
    },
    [updateDashboard, initialDashboard, dashboardData]
  )

  const addSmartView = useCallback(
    async (body: {
      name: string
      condition: SerializedQuery
      view: SupportedViewTypes
    }) => {
      const res = await createSmartViewApi(team.id, {
        dashboardId: initialDashboard.id,
        name: body.name,
        condition: body.condition,
        view: body.view,
        teamId: team.id,
      })

      if (!res.err) {
        setDashboardData((prev) => {
          return {
            ...prev,
            itemsLayouts: [
              ...(prev.itemsLayouts || []),
              {
                i: res.data.data.id,
                x: 0,
                y: 0,
                w: 3,
                h: 4,
              },
            ],
          }
        })
        setSmartViews((prev) => [...prev, res.data.data])
        updateViewsMap([res.data.data.viewId, res.data.data.view])
      }

      return res
    },
    [initialDashboard.id, team.id, createSmartViewApi, updateViewsMap]
  )

  const removeSmartView = useCallback(
    async (smartView: SerializedSmartView) => {
      const res = await deleteSmartViewApi(smartView)

      if (!res.err) {
        setSmartViews((prev) => prev.filter((val) => val.id !== smartView.id))
        setDashboardData((prev) => {
          return {
            ...prev,
            itemsLayouts: (prev.itemsLayouts || []).filter(
              (val) => val.i !== smartView.id
            ),
          }
        })
      }

      return res
    },
    [deleteSmartViewApi]
  )

  const updateSmartView = useCallback(
    async (
      smartView: SerializedSmartView,
      body: UpdateSmartViewRequestBody
    ) => {
      const res = await updateSmartViewApi(smartView, body)

      if (!res.err) {
        const updatedSmartviewData = res.data as UpdateSmartViewResponseBody
        setSmartViews((prev) =>
          prev.reduce((acc, val) => {
            if (val.id === updatedSmartviewData.data.id) {
              acc.push(updatedSmartviewData.data)
            } else {
              acc.push(val)
            }
            return acc
          }, [] as SerializedSmartView[])
        )
        updateViewsMap([
          updatedSmartviewData.data.viewId,
          updatedSmartviewData.data.view,
        ])
      }

      return res
    },
    [updateSmartViewApi, updateViewsMap]
  )

  const removeDashboard = useCallback(async () => {
    const res = await deleteDashboard(initialDashboard)

    if (!res.err) {
      setSmartViews([])
    }

    return res
  }, [deleteDashboard, initialDashboard])

  const actionsRef: DashboardActionsRef = useRef({
    addSmartView,
    removeSmartView,
    removeDashboard,
    updateDashboardLayout,
    updateSmartView,
  })

  useEffect(() => {
    actionsRef.current = {
      addSmartView,
      removeSmartView,
      removeDashboard,
      updateDashboardLayout,
      updateSmartView,
    }
  }, [
    addSmartView,
    removeSmartView,
    removeDashboard,
    updateDashboardLayout,
    updateSmartView,
  ])

  return {
    sendingMap,
    dashboard,
    smartViews,
    actionsRef,
    dashboardData,
  }
}

function cleanupLayouts(layouts: Layout[]) {
  return layouts.map((layout) => pick(layout, 'i', 'x', 'y', 'w', 'h'))
}
