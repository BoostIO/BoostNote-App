import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { BulkApiActionRes } from '../../../../design/lib/hooks/useBulkApi'
import {
  SerializedView,
  SupportedViewTypes,
  ViewParent,
} from '../../../interfaces/db/view'
import { useCloudApi } from '../useCloudApi'
import { getDefaultTableView } from '../../views/table'
import {
  CreateViewResponseBody,
  UpdateViewRequestBody,
} from '../../../api/teams/views'
import { capitalize } from 'lodash'
import { filterIter } from '../../utils/iterator'
import { useNav } from '../../stores/nav'
import { ViewMoveType } from '../../views'
import { sortByLexorankProperty } from '../../utils/string'
import { trackEvent } from '../../../api/track'
import { MixpanelActionTrackTypes } from '../../../interfaces/analytics/mixpanel'

interface ViewHandlerStoreProps {
  parent: ViewParent
  selectNewView: (id: number) => void
}

export type ViewHandlerActionsRef = React.MutableRefObject<{
  createNewView: (
    type: SupportedViewTypes
  ) => Promise<BulkApiActionRes | undefined>
  updateView: (
    view: SerializedView,
    body: Omit<UpdateViewRequestBody, 'move'>
  ) => Promise<BulkApiActionRes | undefined>
  deleteView: (view: SerializedView) => Promise<BulkApiActionRes | undefined>
  moveView: (
    view: SerializedView,
    move: ViewMoveType
  ) => Promise<BulkApiActionRes | undefined>
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

  const orderedViews = useMemo(() => {
    return sortByLexorankProperty(childrenViews, 'order')
  }, [childrenViews])

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
      if (res != null && !res.err) {
        const view = (res.data as CreateViewResponseBody).data
        trackEvent(MixpanelActionTrackTypes.ViewCreate, {
          trueEventName: `view.${view.type}.create`,
          view: view.id,
        })
        selectNewView(view.id)
      }
      return res
    },
    [childrenViews, parent, createViewApi, selectNewView]
  )

  const deleteView = useCallback(
    async (view: SerializedView) => {
      const res = await deleteViewApi(view)
      if (res != null && !res.err) {
        trackEvent(MixpanelActionTrackTypes.ViewDelete, {
          trueEventName: `view.${view.type}.delete`,
          view: view.id,
        })
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

  const updateView = useCallback(
    async (view: SerializedView, body: Omit<UpdateViewRequestBody, 'move'>) => {
      trackEvent(MixpanelActionTrackTypes.ViewEdit, {
        trueEventName: `view.${view.type}.edit`,
        view: view.id,
      })
      return updateViewApi(view, body)
    },
    [updateViewApi]
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
    updateView,
  })

  useEffect(() => {
    actionsRef.current = {
      createNewView,
      deleteView,
      moveView,
      updateView,
    }
  }, [createNewView, deleteView, moveView, updateView])

  return {
    actionsRef,
    sendingMap,
    orderedViews,
  }
}
