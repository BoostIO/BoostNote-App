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
  ViewTableData,
  ViewTableSortingOptions,
} from '../../views/table'
import { CreateViewResponseBody } from '../../../api/teams/views'

interface TableViewStoreProps {
  state: ViewTableData
  view: SerializedView
  selectNewView: (id: number) => void
}

export type TableViewActionsRef = React.MutableRefObject<{
  updateTableSort: (sort: ViewTableSortingOptions) => Promise<BulkApiActionRes>
  addColumn: (col: Column) => Promise<BulkApiActionRes> | undefined
  removeColumn: (col: Column) => Promise<BulkApiActionRes>
  moveColumn: (
    column: Column,
    move: ColumnMoveType
  ) => Promise<BulkApiActionRes> | undefined
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
              workspace: view.workspaceId,
              folder: view.folderId,
              smartView: view.smartViewId,
              type: view.type,
            },
            { data: newState }
          )
        )
        if (!res.err) {
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
      if (
        getArrayFromRecord(state.columns).findIndex(
          (val) => val.name === col.name
        ) !== -1
      ) {
        return
      }

      const newState = Object.assign(state, {
        columns: Object.assign(state.columns, { [col.id]: col }),
      })
      return saveView(view, newState)
    },
    [state, saveView, view]
  )

  const removeColumn = useCallback(
    (col: Column) => {
      const newColumns = Object.assign(state.columns)
      delete newColumns[col.id]
      const newState = Object.assign(state, {
        columns: newColumns,
      })
      return saveView(view, newState)
    },
    [state, saveView, view]
  )

  const moveColumn = useCallback(
    (column: Column, move: ColumnMoveType) => {
      const newState = Object.assign(state, {
        columns: Object.assign(state.columns, {
          [column.id]: {
            ...column,
            order: getColumnOrderAfterMove(
              state.columns || {},
              column.id,
              move
            ),
          },
        }),
      })

      if (newState.columns[column.id].order === column.order) {
        return
      }

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
