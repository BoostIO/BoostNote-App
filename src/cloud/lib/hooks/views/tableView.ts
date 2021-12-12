import { useCallback, useEffect, useRef } from 'react'
import { BulkApiActionRes } from '../../../../design/lib/hooks/useBulkApi'
import { SerializedView } from '../../../interfaces/db/view'
import { useCloudApi } from '../useCloudApi'
import { getArrayFromRecord } from '../../utils/array'
import {
  Column,
  ColumnMoveType,
  getColumnOrderAfterMove,
  isDefaultView,
  isPropCol,
  ViewTableData,
  ViewTableSortingOptions,
} from '../../views/table'
import { CreateViewResponseBody } from '../../../api/teams/views'
import { trackEvent } from '../../../api/track'
import { MixpanelActionTrackTypes } from '../../../interfaces/analytics/mixpanel'
import { capitalize } from 'lodash'

interface TableViewStoreProps {
  state: ViewTableData
  view: SerializedView
  selectNewView: (id: number) => void
}

export type TableViewActionsRef = React.MutableRefObject<{
  updateTableSort: (
    sort: ViewTableSortingOptions
  ) => Promise<BulkApiActionRes | undefined>
  addColumn: (col: Column) => Promise<BulkApiActionRes | undefined> | undefined
  removeColumn: (col: Column) => Promise<BulkApiActionRes | undefined>
  moveColumn: (
    column: Column,
    move: ColumnMoveType
  ) => Promise<BulkApiActionRes | undefined> | undefined
}>

export function useTableView({
  view,
  state,
  selectNewView,
}: TableViewStoreProps) {
  const { updateViewApi, createViewApi } = useCloudApi()

  const saveView = useCallback(
    async (view: SerializedView, newState: ViewTableData) => {
      if (isDefaultView(view)) {
        const res = await createViewApi(
          Object.assign(
            {
              name: capitalize(view.type),
              workspace: view.workspaceId,
              folder: view.folderId,
              smartView: view.smartViewId,
              type: view.type,
            },
            { data: newState }
          )
        )
        if (res != null && !res.err) {
          selectNewView((res.data as CreateViewResponseBody).data.id)
        }
        return res
      }

      return updateViewApi(view, {
        data: newState,
      })
    },
    [createViewApi, updateViewApi, selectNewView]
  )

  const updateTableSort = useCallback(
    (target?: ViewTableSortingOptions) => {
      const newState = Object.assign(state, {
        sort: target || { type: 'static', sort: 'title_az' },
      })
      return saveView(view, newState)
    },
    [state, saveView, view]
  )

  const addColumn = useCallback(
    (col: Column) => {
      const columnState = state.columns || {}
      if (
        getArrayFromRecord(columnState).findIndex(
          (val) => val.name === col.name
        ) !== -1
      ) {
        return
      }

      const newState = Object.assign(state, {
        columns: Object.assign(columnState, { [col.id]: col }),
      })
      trackEvent(MixpanelActionTrackTypes.TableColAdd, {
        colName: col.name,
        colType: isPropCol(col) ? col.type : col.prop,
      })
      return saveView(view, newState)
    },
    [state, saveView, view]
  )

  const removeColumn = useCallback(
    (col: Column) => {
      const columnState = state.columns || {}
      const newColumns = Object.assign(columnState)
      delete newColumns[col.id]
      const newState = Object.assign(state, {
        columns: newColumns,
      })
      trackEvent(MixpanelActionTrackTypes.TableColDelete, {
        colName: col.name,
        colType: isPropCol(col) ? col.type : col.prop,
      })
      return saveView(view, newState)
    },
    [state, saveView, view]
  )

  const moveColumn = useCallback(
    (column: Column, move: ColumnMoveType) => {
      const columnState = state.columns || {}
      const newState = Object.assign(state, {
        columns: Object.assign(columnState, {
          [column.id]: {
            ...column,
            order: getColumnOrderAfterMove(columnState, column.id, move),
          },
        }),
      })

      if (newState.columns[column.id].order === column.order) {
        return
      }

      trackEvent(MixpanelActionTrackTypes.TableColUpdateOrder, {
        colName: column.name,
        colType: isPropCol(column) ? column.type : column.prop,
      })
      return saveView(view, newState)
    },
    [state, saveView, view]
  )

  const actionsRef: TableViewActionsRef = useRef({
    addColumn,
    removeColumn,
    moveColumn,
    updateTableSort,
  })

  useEffect(() => {
    actionsRef.current = {
      moveColumn: moveColumn,
      addColumn: addColumn,
      removeColumn: removeColumn,
      updateTableSort: updateTableSort,
    }
  }, [removeColumn, addColumn, moveColumn, updateTableSort])

  return {
    actionsRef,
  }
}
