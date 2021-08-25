import { useState, useEffect, useCallback } from 'react'
import { Notification } from '../../../cloud/interfaces/db/notifications'
import { useNotifications } from '../stores/notifications'
import { NotificationState } from '../../components/molecules/NotificationList'

function useNotificationState(team?: string) {
  const [state, setState] = useState<NotificationState>({
    type: 'loading',
    team,
  })
  const { observeTeamNotifications, getMore, setViewed } = useNotifications()

  useEffect(() => {
    if (team == null) return

    return observeTeamNotifications(team, (notifications) => {
      setState(updateNotifications(notifications))
    })
  }, [team, observeTeamNotifications])

  const getMoreOfTeam = useCallback(async () => {
    if (team == null) return
    try {
      setState(transitionLoadedWorking)
      await getMore(team)
    } finally {
      setState(transitionWorkingLoaded(team))
    }
  }, [getMore, team])

  return { state, getMore: getMoreOfTeam, setViewed }
}

function updateNotifications(notifications: Notification[]) {
  return (state: NotificationState): NotificationState => {
    switch (state.type) {
      case 'loading':
        return state.team != null
          ? { type: 'loaded', notifications, team: state.team }
          : state
      case 'loaded':
      case 'working':
        return { ...state, notifications }
    }
  }
}

function transitionLoadedWorking(state: NotificationState): NotificationState {
  return state.type === 'loaded' ? { ...state, type: 'working' } : state
}

function transitionWorkingLoaded(team: string) {
  return (state: NotificationState): NotificationState => {
    return state.type === 'working' && state.team === team
      ? { ...state, type: 'loaded' }
      : state
  }
}

export default useNotificationState
