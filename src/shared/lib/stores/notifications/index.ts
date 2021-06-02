import { createStoreContext } from '../../utils/context'
import { useState, useRef, useCallback } from 'react'
import { Notification } from '../../../../cloud/interfaces/db/notifications'
import { useToast } from '../toast'
import {
  listNotifications,
  getNotification,
  setNotificationViewed,
} from '../../../../cloud/api/notifications'
import groupBy from 'ramda/es/groupBy'
import prop from 'ramda/es/prop'
import { mergeOnId } from '../../utils/array'
import { SerializedAppEvent } from '../../../../cloud/interfaces/db/appEvents'

type Observer = (notifications: Notification[]) => void

function useNotificationStore() {
  const { pushApiErrorMessage } = useToast()
  const cacheRef = useRef<Map<string, Notification[]>>(new Map())
  const observersRef = useRef<Map<string, Set<Observer>>>(new Map())
  const [counts, setCounts] = useState<Record<string, number>>({})
  const oldestAllRef = useRef<Map<string, Date>>(new Map())

  const observeTeamNotifications = useCallback(
    (teamId: string, observer: Observer) => {
      const current = cacheRef.current.get(teamId)

      const observers = observersRef.current.get(teamId) || new Set()
      observers.add(observer)
      observersRef.current.set(teamId, observers)

      if (current != null) {
        Promise.resolve(current).then(observer)
      } else {
        Promise.all([
          listNotifications({ team: teamId, viewed: false }),
          listNotifications({ team: teamId }, { page: 1, perPage: 10 }),
        ])
          .then(([unviewed, all]) => {
            const notifications = mergeOnId(
              unviewed.notifications,
              all.notifications
            )

            if (all.notifications.length > 0) {
              oldestAllRef.current.set(
                teamId,
                all.notifications[all.notifications.length - 1].createdAt
              )
            }

            insertNotifications(
              notifications,
              cacheRef.current,
              observersRef.current
            )
            setCounts(all.counts.teams)
          })
          .catch(pushApiErrorMessage)
      }

      return () => {
        const observers = observersRef.current.get(teamId) || new Set()
        observers.delete(observer)
      }
    },
    [pushApiErrorMessage]
  )

  const getMore = useCallback(
    async (team: string) => {
      try {
        if (cacheRef.current.has(team)) {
          const { notifications, counts } = await listNotifications(
            { team, before: oldestAllRef.current.get(team) },
            { page: 1, perPage: 10 }
          )

          if (notifications.length > 0) {
            oldestAllRef.current.set(
              team,
              notifications[notifications.length - 1].createdAt
            )
          }

          insertNotifications(
            notifications,
            cacheRef.current,
            observersRef.current
          )
          setCounts(counts.teams)
        } else {
          const [unviewed, all] = await Promise.all([
            listNotifications({ team, viewed: false }),
            listNotifications({ team }, { page: 1, perPage: 10 }),
          ])
          const notifications = mergeOnId(
            unviewed.notifications,
            all.notifications
          )

          if (all.notifications.length > 0) {
            oldestAllRef.current.set(
              team,
              all.notifications[all.notifications.length - 1].createdAt
            )
          }

          insertNotifications(
            notifications,
            cacheRef.current,
            observersRef.current
          )
          setCounts(all.counts.teams)
        }
      } catch (error) {
        pushApiErrorMessage(error)
      }
    },
    [pushApiErrorMessage]
  )

  const setViewed = useCallback(
    async (notification: Notification) => {
      try {
        const updated = await setNotificationViewed(notification)
        insertNotifications([updated], cacheRef.current, observersRef.current)
      } catch (error) {
        pushApiErrorMessage(error)
      }
    },
    [pushApiErrorMessage]
  )

  const notificationsEventListener = useCallback(
    async (event: SerializedAppEvent) => {
      switch (event.type) {
        case 'notificationCreated': {
          if (cacheRef.current.has(event.data.teamId)) {
            const notification = await getNotification(
              event.data.notificationId
            )
            insertNotifications(
              [notification],
              cacheRef.current,
              observersRef.current
            )
          }
          setCounts((prev) => {
            return {
              ...prev,
              [event.data.teamId]: (prev[event.data.teamId] || 0) + 1,
            }
          })
        }
      }
    },
    []
  )

  return {
    observeTeamNotifications,
    getMore,
    setViewed,
    counts,
    notificationsEventListener,
  }
}

function insertNotifications(
  notifications: Notification[],
  cache: Map<string, Notification[]>,
  observersMap: Map<string, Set<Observer>>
) {
  const partioned = groupBy(prop('team'), notifications)
  const teams = Object.keys(partioned)
  for (const teamId of teams) {
    const existing = cache.get(teamId) || []
    const merged = mergeOnId(existing, partioned[teamId])
    cache.set(teamId, merged)
    const observers = observersMap.get(teamId) || new Set()
    for (const observer of observers) {
      observer(merged)
    }
  }
}

export const {
  StoreProvider: NotificationsProvider,
  useStore: useNotifications,
} = createStoreContext(useNotificationStore)
