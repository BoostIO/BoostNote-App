import { useCallback, useEffect, useRef } from 'react'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { mockBackend, sseUrl } from '../lib/consts'
import { useNumber } from 'react-use'
import {
  ResourcesIdSortedByWorkspaceIds,
  SerializedAppEvent,
} from '../interfaces/db/appEvents'
import { getMapFromEntityArray } from '../../design/lib/utils/array'
import { getResources } from '../api/teams/resources'
import { SerializedWorkspace } from '../interfaces/db/workspace'
import { SerializedTag } from '../interfaces/db/tag'
import { useGlobalData } from '../lib/stores/globalData'
import { useNav } from '../lib/stores/nav'
import { usePage } from '../lib/stores/pageStore'
import { SerializedTeam } from '../interfaces/db/team'
import { getTemplate } from '../api/teams/docs/templates'
import { getUniqueFolderAndDocIdsFromResourcesIds } from '../lib/utils/patterns'
import { getAccessToken, useElectron } from '../lib/stores/electron'
import { useNotifications } from '../../design/lib/stores/notifications'
import { useComments } from '../lib/stores/comments'
import { SerializedView } from '../interfaces/db/view'

interface EventSourceProps {
  teamId: string
}

const defaultReconnectionDelay = 500 // 5ms
const maxReconnectionDelay = 600000 // 10min

const EventSource = ({ teamId }: EventSourceProps) => {
  const eventSourceRef = useRef<EventSource | undefined>()
  const [eventSourceSetupCounter, { inc }] = useNumber(0)
  const reconnectionDelayRef = useRef<number>(defaultReconnectionDelay)
  const { usingElectron, sendToElectron } = useElectron()

  const {
    team,
    removeUserInPermissions,
    updateUserInPermissions,
    updateTeamSubscription,
    updateSinglePermission,
    removeSinglePermission,
    setPartialPageData,
  } = usePage()
  const {
    removeFromTagsMap,
    updateTagsMap,
    updateWorkspacesMap,
    removeFromWorkspacesMap,
    docsMap,
    foldersMap,
    removeFromDocsMap,
    removeFromFoldersMap,
    updateDocsMap,
    updateFoldersMap,
    updateTemplatesMap,
    removeFromTemplatesMap,
    updateSmartViewsMap: updateSmartViewFoldersMap,
    removeFromSmartViewsMap: removeFromSmartViewFoldersMap,
    updateAppEventsMap,
    removeFromViewsMap,
    updateViewsMap,
  } = useNav()
  const {
    setPartialGlobalData,
    globalDataRef,
    globalData: { currentUser, teams },
  } = useGlobalData()
  const { commentsEventListener } = useComments()
  const { notificationsEventListener } = useNotifications()

  const setupEventSource = useCallback(
    (url: string) => {
      if (mockBackend) {
        return
      }
      if (eventSourceRef.current != null) {
        eventSourceRef.current.close()
      }
      const accessToken = getAccessToken()
      const newEventSource = new EventSourcePolyfill(url, {
        withCredentials: true,
        headers:
          accessToken != null
            ? {
                ['Authorization']: `Bearer ${accessToken}`,
              }
            : {},
      })
      newEventSource.onerror = () => {
        newEventSource.close()
        setTimeout(() => {
          setupEventSource(eventSourceRef.current!.url)
          reconnectionDelayRef.current = Math.min(
            defaultReconnectionDelay *
              ((reconnectionDelayRef.current / defaultReconnectionDelay) * 2),
            maxReconnectionDelay
          )
        }, reconnectionDelayRef.current)
      }
      eventSourceRef.current = newEventSource
      inc(1)
    },
    [inc]
  )

  useEffect(() => {
    setupEventSource(`${sseUrl}/events/${teamId}`)
    return () => {
      try {
        eventSourceRef.current!.close()
      } catch (error) {}
    }
  }, [teamId, setupEventSource])

  const userRemovalEventHandler = useCallback(
    (event: SerializedAppEvent) => {
      if (event.data.userId === null) {
        return
      }
      // global
      setPartialGlobalData({
        teams: globalDataRef.current.teams.map((team) => {
          return {
            ...team,
            permissions: team.permissions.filter(
              (p) => p.user.id !== event.data.userId
            ),
          }
        }),
      })
      //page
      removeUserInPermissions(event.data.userId)
    },
    [setPartialGlobalData, globalDataRef, removeUserInPermissions]
  )

  const userUpdateEventHandler = useCallback(
    (event: SerializedAppEvent) => {
      if (event.userId != null && event.data.displayName != null) {
        updateUserInPermissions({
          id: event.userId,
          displayName: event.data.displayName,
        })
      }
    },
    [updateUserInPermissions]
  )

  const subscriptionChangeEventHandler = useCallback(
    (event: SerializedAppEvent) => {
      if (event.data.subscription.status === 'inactive') {
        updateTeamSubscription(undefined)
        if (usingElectron) {
          sendToElectron('subscription-delete', event.data.subscription)
        }
      } else {
        updateTeamSubscription(event.data.subscription)
        if (usingElectron) {
          sendToElectron('subscription-update', event.data.subscription)
        }
      }
    },
    [updateTeamSubscription, usingElectron, sendToElectron]
  )

  const permissionsUpdateEventHandler = useCallback(
    (event: SerializedAppEvent) => {
      if (event.data.userPermissions != null) {
        updateSinglePermission(event.data.userPermissions)
      }
    },
    [updateSinglePermission]
  )

  const permissionsRemoveEventHandler = useCallback(
    (event: SerializedAppEvent) => {
      if (event.data.userPermissionsId != null) {
        removeSinglePermission(event.data.userPermissionsId)
      }
    },
    [removeSinglePermission]
  )

  const teamUpdateHandler = useCallback(
    (event: SerializedAppEvent) => {
      const eventTeam = event.data.team as Partial<SerializedTeam>
      if (eventTeam != null && team != null) {
        setPartialPageData({ team: { ...team, ...eventTeam } })
        const updatedTeams = teams.map((t) => {
          if (t.id === eventTeam.id) {
            return { ...t, ...eventTeam }
          }
          return t
        })
        setPartialGlobalData({ teams: updatedTeams })
      }

      if (usingElectron) {
        sendToElectron('team-update', { ...team, ...eventTeam })
      }
    },
    [
      setPartialGlobalData,
      setPartialPageData,
      teams,
      team,
      usingElectron,
      sendToElectron,
    ]
  )

  const tagChangeEventHandler = useCallback(
    (event: SerializedAppEvent) => {
      const tag = event.data.tag as SerializedTag
      if (event.type === 'tagCreate') {
        updateTagsMap([tag.id, tag])
        return
      }

      removeFromTagsMap(tag.id)
    },
    [removeFromTagsMap, updateTagsMap]
  )

  const workspaceChangeEventHandler = useCallback(
    async (event: SerializedAppEvent) => {
      if (event.type !== 'workspaceRemoval') {
        const workspace = event.data.workspace as SerializedWorkspace
        updateWorkspacesMap([workspace.id, workspace])
        const addedUsers = event.data.added as string[]
        if (currentUser != null && addedUsers.includes(currentUser.id)) {
          const { docs, folders, workspaces } = await getResources(
            event.teamId!,
            {
              resourcesIds: [],
              workspacesIds: [workspace.id],
            }
          )
          const changedWorkspaces = getMapFromEntityArray(workspaces)
          updateWorkspacesMap(...changedWorkspaces)
          const changedFolders = getMapFromEntityArray(folders)
          updateFoldersMap(...changedFolders)
          const changedDocs = getMapFromEntityArray(docs)
          updateDocsMap(...changedDocs)
        }
        return
      }

      if (typeof event.data.workspace !== 'string') {
        return
      }

      removeFromWorkspacesMap(event.data.workspace)
      removeFromDocsMap(
        ...[...docsMap.values()]
          .filter((doc) => doc.workspaceId === event.data.workspace)
          .map((doc) => doc.id)
      )
      removeFromFoldersMap(
        ...[...foldersMap.values()]
          .filter((folder) => folder.workspaceId === event.data.workspace)
          .map((folder) => folder.id)
      )
    },
    [
      removeFromWorkspacesMap,
      updateWorkspacesMap,
      docsMap,
      removeFromDocsMap,
      foldersMap,
      removeFromFoldersMap,
      currentUser,
      updateDocsMap,
      updateFoldersMap,
    ]
  )

  const templateChangeEventHandler = useCallback(
    async (event: SerializedAppEvent) => {
      if (event.type === 'templateDelete') {
        if (typeof event.data.template === 'string') {
          removeFromTemplatesMap(event.data.template)
        }
        return
      }

      try {
        if (typeof event.data.template === 'string') {
          const { template } = await getTemplate(event.data.template)
          updateTemplatesMap([template.id, template])
        } else {
          updateTemplatesMap([event.data.template.id, event.data.template])
        }
      } catch (error) {}
    },
    [removeFromTemplatesMap, updateTemplatesMap]
  )

  const eventSourceResourceUpdateHandler = useCallback(
    async (event: SerializedAppEvent) => {
      try {
        if (event.teamId == null) {
          return
        }
        const resourcesIds: string[] = []
        const workspacesIds: string[] = []

        if (event.data != null) {
          if (
            event.type === 'resourcesUpdate' &&
            event.data['resources'] != null
          ) {
            const data = event.data[
              'resources'
            ] as ResourcesIdSortedByWorkspaceIds
            const idSet = new Set<string>()
            Object.keys(data).forEach((workspaceId) => {
              workspacesIds.push(workspaceId)
              ;(data[workspaceId] || []).forEach((resourceId) => {
                idSet.add(resourceId)
              })
            })
            resourcesIds.push(...idSet.values())
          }
          if (event.data['resource'] != null) {
            resourcesIds.push(event.data['resource'])
          }
          if (event.data['workspaceId'] != null) {
            workspacesIds.push(event.data['workspaceId'])
          }
        }

        const { docs, folders, workspaces } = await getResources(event.teamId, {
          resourcesIds,
          workspacesIds,
          minimal: true,
        })
        /** -- update -- **/
        const changedWorkspaces = getMapFromEntityArray(workspaces)
        updateWorkspacesMap(...changedWorkspaces)
        workspacesIds.forEach((id) => {
          if (!changedWorkspaces.has(id)) {
            removeFromWorkspacesMap(id)
          }
        })
        const changedFolders = getMapFromEntityArray(folders)
        updateFoldersMap(...changedFolders)
        const changedDocs = getMapFromEntityArray(docs)
        updateDocsMap(...changedDocs)
        /** check removals **/
        const { uniqueFoldersIds, uniqueDocsIds } =
          getUniqueFolderAndDocIdsFromResourcesIds(resourcesIds)
        uniqueFoldersIds.forEach((folderId) => {
          if (!changedFolders.has(folderId)) {
            removeFromFoldersMap(folderId)
          }
        })
        uniqueDocsIds.forEach((docId) => {
          if (!changedDocs.has(docId)) {
            removeFromDocsMap(docId)
          }
        })
      } catch (error) {}
    },
    [
      updateDocsMap,
      removeFromDocsMap,
      updateFoldersMap,
      updateWorkspacesMap,
      removeFromFoldersMap,
      removeFromWorkspacesMap,
    ]
  )

  const smartViewUpdateHandler = useCallback(
    (event: SerializedAppEvent) => {
      updateSmartViewFoldersMap([event.data.smartView.id, event.data.smartView])
    },
    [updateSmartViewFoldersMap]
  )
  const smartViewDeleteHandler = useCallback(
    (event: SerializedAppEvent) => {
      removeFromSmartViewFoldersMap(event.data.smartViewId)
    },
    [removeFromSmartViewFoldersMap]
  )

  const viewChangeEventHandler = useCallback(
    (event: SerializedAppEvent) => {
      const view = event.data.view as SerializedView
      if (event.type === 'viewDeleted') {
        removeFromViewsMap(view.id)
        return
      }

      updateViewsMap([view.id, view])
    },
    [removeFromViewsMap, updateViewsMap]
  )

  /// re-assign handler on change
  useEffect(() => {
    if (eventSourceRef.current != null && eventSourceSetupCounter > 0) {
      eventSourceRef.current.onopen = () =>
        (reconnectionDelayRef.current = defaultReconnectionDelay)
      eventSourceRef.current.onmessage = (eventData: MessageEvent) => {
        const event = JSON.parse(eventData.data) as SerializedAppEvent
        switch (event.type) {
          case 'teamUpdate':
            teamUpdateHandler(event)
            break
          case 'permissionsCreate':
            permissionsUpdateEventHandler(event)
            break
          case 'permissionsRemoval':
            permissionsRemoveEventHandler(event)
            break
          case 'subscriptionUpdate':
          case 'subscriptionCreate':
            subscriptionChangeEventHandler(event)
            break
          case 'createDoc':
          case 'contentUpdate':
          case 'resourcesUpdate':
          case 'archiveDoc':
          case 'unarchiveDoc':
            eventSourceResourceUpdateHandler(event)
            break
          case 'userRemoval':
            userRemovalEventHandler(event)
            break
          case 'userUpdate':
            userUpdateEventHandler(event)
            break
          case 'tagCreate':
          case 'tagRemoval':
            tagChangeEventHandler(event)
            break
          case 'templateDelete':
          case 'templateUpdate':
            templateChangeEventHandler(event)
            break
          case 'workspaceCreate':
          case 'workspaceRemoval':
          case 'workspaceUpdate':
            workspaceChangeEventHandler(event)
            break
          case 'commentThreadCreated':
          case 'commentThreadUpdated':
          case 'commentThreadDeleted':
          case 'commentCreated':
          case 'commentUpdated':
          case 'commentDeleted':
            commentsEventListener(event)
            break
          case 'smartViewCreate':
          case 'smartViewUpdate':
            smartViewUpdateHandler(event)
            break
          case 'smartViewDelete':
            smartViewDeleteHandler(event)
            break
          case 'notificationCreated':
          case 'notificationViewed':
            notificationsEventListener(event)
            break
          case 'viewCreated':
          case 'viewUpdated':
          case 'viewDeleted':
            viewChangeEventHandler(event)
            break
        }
        updateAppEventsMap([event.id, event])
      }
    }
    return
  }, [
    eventSourceResourceUpdateHandler,
    eventSourceSetupCounter,
    userRemovalEventHandler,
    userUpdateEventHandler,
    subscriptionChangeEventHandler,
    permissionsRemoveEventHandler,
    permissionsUpdateEventHandler,
    workspaceChangeEventHandler,
    tagChangeEventHandler,
    teamUpdateHandler,
    templateChangeEventHandler,
    commentsEventListener,
    smartViewUpdateHandler,
    smartViewDeleteHandler,
    updateAppEventsMap,
    notificationsEventListener,
    viewChangeEventHandler,
  ])

  return null
}

export default EventSource
