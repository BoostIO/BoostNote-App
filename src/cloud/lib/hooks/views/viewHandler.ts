import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { BulkApiActionRes } from '../../../../design/lib/hooks/useBulkApi'
import {
  SerializedView,
  SupportedViewTypes,
  ViewParent,
} from '../../../interfaces/db/view'
import { useCloudApi } from '../useCloudApi'
import { getDefaultTableView } from '../../views/table'
import { CreateViewResponseBody } from '../../../api/teams/views'
import { capitalize } from 'lodash'
import { filterIter } from '../../utils/iterator'
import { useNav } from '../../stores/nav'
import { ViewMoveType } from '../../views'

interface ViewHandlerStoreProps {
  parent: ViewParent
  selectNewView: (id: number) => void
}

export type ViewHandlerActionsRef = React.MutableRefObject<{
  createNewView: (type: SupportedViewTypes) => Promise<BulkApiActionRes>
  deleteView: (view: SerializedView) => Promise<BulkApiActionRes>
  moveView: (
    view: SerializedView,
    move: ViewMoveType
  ) => Promise<BulkApiActionRes>
}>

export function useViewHandler({
  parent,
  selectNewView,
}: ViewHandlerStoreProps) {
  const {
    updateViewApi,
    createViewApi,
    deleteViewApi,
    sendingMap,
  } = useCloudApi()
  const { viewsMap } = useNav()

  const childrenViews = useMemo(() => {
    switch (parent.type) {
      case 'folder':
        return filterIter(
          (view) => view.folderId === parent.target.id,
          viewsMap.values()
        )
      case 'workspace':
        return filterIter(
          (view) => view.workspaceId === parent.target.id,
          viewsMap.values()
        )
      case 'smartView':
        return filterIter(
          (view) => view.smartViewId === parent.target.id,
          viewsMap.values()
        )
    }
  }, [parent, viewsMap])

  const createNewView = useCallback(
    async (type: SupportedViewTypes) => {
      const viewsOfTheSameType = filterIter(
        (view) => view.type === type,
        childrenViews
      ).length
      const name = `${capitalize(type)}${
        viewsOfTheSameType === 0 ? '' : ` ${viewsOfTheSameType}`
      }`
      const res = await createViewApi(
        parent.type === 'folder'
          ? { folder: parent.target.id, type, name }
          : parent.type === 'workspace'
          ? { workspace: parent.target.id, type, name }
          : { smartView: parent.target.id, type, name }
      )
      if (!res.err) {
        selectNewView((res.data as CreateViewResponseBody).data.id)
      }
      return res
    },
    [childrenViews, parent, createViewApi, selectNewView]
  )

  const deleteView = useCallback(
    async (view: SerializedView) => {
      const res = await deleteViewApi(view)
      if (!res.err) {
        const children = filterIter((v) => v.id !== view.id, childrenViews)
        selectNewView(
          children.length !== 0
            ? children[0].id
            : getDefaultTableView(parent).id
        )
      }
      return res
    },
    [childrenViews, deleteViewApi, parent, selectNewView]
  )

  const moveView = useCallback(
    async (view: SerializedView, move: ViewMoveType) => {
      return updateViewApi(view, { move })
    },
    [updateViewApi]
  )

  const actionsRef: ViewHandlerActionsRef = useRef({
    createNewView,
    deleteView,
    moveView,
  })

  useEffect(() => {
    actionsRef.current = {
      createNewView,
      deleteView,
      moveView,
    }
  }, [createNewView, deleteView, moveView])

  return {
    actionsRef,
    sendingMap,
  }
}
