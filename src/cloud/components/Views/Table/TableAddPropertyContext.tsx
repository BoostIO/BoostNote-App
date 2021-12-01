import React, { useCallback, useMemo, useState } from 'react'
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
  isPropCol,
  makeTablePropColId,
} from '../../../lib/views/table'
import PropsAddModal, {
  getPropsAddFormUniqueName,
} from '../../Props/PropAddModal'

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
  const [sending, setSending] = useState<string>()
  const [columnName, setColumnName] = useState('')
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
      if (sending != null) {
        return
      }

      setSending(
        !isPropCol(col)
          ? getPropsAddFormUniqueName(col.name, col.prop)
          : getPropsAddFormUniqueName(col.name, col.type, col.subType)
      )
      const res = await addColumn(col)
      setSending(undefined)
      if (res != null && !res.err) {
        close()
      }
    },
    [addColumn, close, sending]
  )

  const addNewPropCol = useCallback(
    (name: string, type: PropType, subType?: PropSubType) => {
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
    (name: string, prop: StaticPropType) => {
      addCol({
        id: makeTablePropColId(name, prop),
        name: name,
        prop,
        order: getInsertedColumnOrder(columns),
      })
    },
    [addCol, columns]
  )

  const isColumnNameInvalid = useMemo(() => {
    const value = columnName.trim()

    if (value === '') {
      return false
    }

    return Object.values(columns).reduce((acc, val) => {
      if (value === val.name) {
        acc = true
      }
      return acc
    }, false)
  }, [columns, columnName])

  return (
    <PropsAddModal
      columnName={columnName}
      setColumnName={setColumnName}
      fetchPropertySuggestions={fetchSuggestions}
      isColumnNameInvalid={isColumnNameInvalid}
      allocatedNames={Object.values(columns).map((col) => col.name)}
      addNewStaticCol={addNewStaticCol}
      addNewPropCol={addNewPropCol}
      sending={sending}
      showDocPageForm={false}
    />
  )
}

export default TableAddPropertyContext
