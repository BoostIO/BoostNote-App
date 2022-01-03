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
  removeSmartView: (smartView: SerializedSmartView) => Promise<BulkApiActionRes>
  removeDashboard: () => Promise<BulkApiActionRes>
  updateDashboardLayout: (layouts: Layout[]) => void
}>

export function useDashboard({
  dashboard: initialDashboard,
  smartViews: initialSmartViews,
  team,
}: DashboardStoreProps) {
  const [smartViews, setSmartViews] = useState(initialSmartViews)
  const [dashboardData, setDashboardData] = useState(
    initialDashboard.data || {}
  )

  const { dashboardsMap } = useNav()
  const {
    createSmartViewApi,
    deleteDashboard,
    deleteSmartViewApi,
    updateDashboard,
    sendingMap,
  } = useCloudApi()

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
      }

      return res
    },
    [initialDashboard.id, team.id, createSmartViewApi]
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
  })

  useEffect(() => {
    actionsRef.current = {
      addSmartView,
      removeSmartView,
      removeDashboard,
      updateDashboardLayout,
    }
  }, [addSmartView, removeSmartView, removeDashboard, updateDashboardLayout])

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
