import { useCallback, useEffect, useMemo, useRef } from 'react'
import { BulkApiActionRes } from '../../../../design/lib/hooks/useBulkApi'
import { SerializedView } from '../../../interfaces/db/view'
import { useCloudApi } from '../useCloudApi'
import { ListViewProp, sortListViewProps, ViewListData } from '../../views/list'
import { CreateViewResponseBody } from '../../../api/teams/views'
import { capitalize } from 'lodash'
import { isDefaultView } from '../../views'

interface ListViewStoreProps {
  view: SerializedView<ViewListData>
  selectNewView: (id: number) => void
}

export type ListViewActionsRef = React.MutableRefObject<{
  setProperties: (
    view: SerializedView,
    props: Record<string, ListViewProp>
  ) => Promise<BulkApiActionRes>
}>

export function useListView({ view, selectNewView }: ListViewStoreProps) {
  const { updateViewApi, createViewApi } = useCloudApi()

  const saveView = useCallback(
    async (view: SerializedView, newState: ViewListData) => {
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

  const props = useMemo(() => {
    return sortListViewProps(view.data.props || {})
  }, [view])

  const setProperties = useCallback(
    async (view: SerializedView, props: Record<string, ListViewProp>) => {
      return saveView(view, { ...view.data, props })
    },
    [saveView]
  )

  const actionsRef: ListViewActionsRef = useRef({
    setProperties,
  })

  useEffect(() => {
    actionsRef.current = {
      setProperties,
    }
  }, [setProperties])

  return {
    props,
    actionsRef,
  }
}
