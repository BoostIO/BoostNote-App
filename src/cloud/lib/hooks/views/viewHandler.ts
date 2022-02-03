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
import { getDefaultListView } from '../../views/list'

interface ViewHandlerStoreProps {
  parent: ViewParent
  selectNewView: (shortId: string) => void
}

export type ViewHandlerActionsRef = React.MutableRefObject<{
  createNewView: (
    type: SupportedViewTypes,
    name?: string
  ) => Promise<BulkApiActionRes>
  updateView: (
    view: SerializedView,
    body: Omit<UpdateViewRequestBody, 'move'>
  ) => Promise<BulkApiActionRes>
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
  const { updateViewApi, createViewApi, deleteViewApi, sendingMap } =
    useCloudApi()
  const { viewsMap } = useNav()

  const childrenViews = useMemo(() => {
    let views: SerializedView[] = []
    switch (parent.type) {
      case 'folder':
        views = filterIter(
          (view) => view.folderId === parent.target.id,
          viewsMap.values()
        )
        break
      case 'workspace':
        views = filterIter(
          (view) => view.workspaceId === parent.target.id,
          viewsMap.values()
        )
        break
      case 'smartView':
        views = filterIter(
          (view) => view.smartViewId === parent.target.id,
          viewsMap.values()
        )
        break
    }

    if (views.length === 0) {
      views = [getDefaultListView(parent)]
    }

    return views
  }, [parent, viewsMap])

  const orderedViews = useMemo(() => {
    return sortByLexorankProperty(childrenViews, 'order')
  }, [childrenViews])

  const createNewView = useCallback(
    async (type: SupportedViewTypes, defaultName?: string) => {
      const viewsOfTheSameType = filterIter(
        (view) => view.type === type,
        childrenViews
      ).length
      const name =
        defaultName ||
        `${capitalize(type)}${
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
        const view = (res.data as CreateViewResponseBody).data
        trackEvent(MixpanelActionTrackTypes.ViewCreate, {
          trueEventName: `view.${view.type}.create`,
          view: view.id,
        })
        selectNewView(view.shortId)
      }
      return res
    },
    [childrenViews, parent, createViewApi, selectNewView]
  )

  const deleteView = useCallback(
    async (view: SerializedView) => {
      const res = await deleteViewApi(view)
      if (!res.err) {
        trackEvent(MixpanelActionTrackTypes.ViewDelete, {
          trueEventName: `view.${view.type}.delete`,
          view: view.id,
        })
        const children = filterIter((v) => v.id !== view.id, childrenViews)
        selectNewView(
          children.length !== 0
            ? children[0].shortId
            : getDefaultTableView(parent).shortId
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
