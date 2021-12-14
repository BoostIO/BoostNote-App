import React, { useCallback } from 'react'
import { BulkApiActionRes } from '../../../../design/lib/hooks/useBulkApi'
import {
  ListPropertySuggestionsRequestBody,
  ListPropertySuggestionsResponseBody,
} from '../../../api/teams/props'
import {
  PropSubType,
  PropType,
  StaticPropType,
} from '../../../interfaces/db/props'
import { SerializedView } from '../../../interfaces/db/view'
import { useCloudApi } from '../../../lib/hooks/useCloudApi'
import {
  Column,
  getInsertedColumnOrder,
  makeTablePropColId,
} from '../../../lib/views/table'
import PropRegisterModal from '../../Props/PropRegisterModal'

interface TableAddPropertyContextProps {
  view: SerializedView
  teamId: string
  columns: Record<string, Column>
  addColumn: (col: Column) => Promise<BulkApiActionRes> | undefined
  close: () => void
}

const TableAddPropertyContext = ({
  view,
  teamId,
  columns,
  addColumn,
  close,
}: TableAddPropertyContextProps) => {
  const { fetchPropertySuggestionsApi } = useCloudApi()

  const fetchSuggestions = useCallback(async () => {
    const body: ListPropertySuggestionsRequestBody = { team: teamId }
    if (view.folderId != null) {
      body.folder = view.folderId
    }

    if (view.workspaceId != null) {
      body.workspace = view.workspaceId
    }

    if (view.smartViewId != null) {
      return []
    }

    const res = await fetchPropertySuggestionsApi(body)
    if (!res.err) {
      return (res.data as ListPropertySuggestionsResponseBody).data
    } else {
      return []
    }
  }, [
    teamId,
    fetchPropertySuggestionsApi,
    view.folderId,
    view.workspaceId,
    view.smartViewId,
  ])

  const addCol = useCallback(
    async (col: Column) => {
      const res = await addColumn(col)
      if (res != null && !res.err) {
        close()
      }
    },
    [addColumn, close]
  )

  const addNewPropCol = useCallback(
    ({
      name,
      type,
      subType,
    }: {
      name: string
      type: PropType
      subType?: PropSubType
    }) => {
      addCol({
        id: makeTablePropColId(name, type, subType),
        name: name,
        type,
        subType,
        order: getInsertedColumnOrder(columns),
      })
    },
    [addCol, columns]
  )

  const addNewStaticCol = useCallback(
    ({ name, prop }: { name: string; prop: StaticPropType }) => {
      addCol({
        id: makeTablePropColId(name, prop),
        name: name,
        prop,
        order: getInsertedColumnOrder(columns),
      })
    },
    [addCol, columns]
  )

  const isColumnNameInvalid = useCallback(
    (columnName: string) => {
      const value = columnName.trim()

      if (value === '') {
        return false
      }

      return !Object.values(columns).some((prop) => prop.name === value)
    },
    [columns]
  )

  return (
    <PropRegisterModal
      registerProp={addNewPropCol}
      registerStaticProp={addNewStaticCol}
      fetchPropertySuggestions={fetchSuggestions}
      isNameValid={isColumnNameInvalid}
    />
  )
}

export default TableAddPropertyContext
