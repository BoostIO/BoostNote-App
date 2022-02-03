import { useState, useCallback, useEffect } from 'react'
import { createStoreContext } from '../../utils/context'
import { usePage } from '../pageStore'
import { localLiteStorage } from 'ltstrg'
import { teamPreferenceskey } from '../../localStorageKeys'
import {
  TeamPreferencesContext,
  LocallyStoredTeamPreferences,
  TeamPreferencesContent,
  TeamPreferencesType,
} from './types'

function useTeamPreferencesStore(): TeamPreferencesContext {
  const { team } = usePage()
  const [currentTeamPreferences, setCurrentTeamPreferences] =
    useState<TeamPreferencesContent>({})

  const setToLocalStorage = useCallback(
    (teamId: string, content: TeamPreferencesContent) => {
      let baseData = localLiteStorage.getItem(teamPreferenceskey)
      if (baseData == null) {
        baseData = '{}'
      }
      const data = JSON.parse(baseData)
      data[teamId] = content
      localLiteStorage.setItem(teamPreferenceskey, JSON.stringify(data))
    },
    []
  )

  const toggleItem = useCallback((type: TeamPreferencesType) => {
    setCurrentTeamPreferences((prev) => {
      const newState = Object.assign({}, prev)
      if (newState[type] != null) {
        delete newState[type]
      } else {
        newState[type] = true
      }
      return newState
    })
  }, [])

  // LOAD FROM LOCAL STORAGE
  useEffect(() => {
    if (team == null) {
      return
    }

    try {
      const stringifiedData = localLiteStorage.getItem(teamPreferenceskey)
      if (stringifiedData == null) {
        return
      }
      const locallyStoredDatas = JSON.parse(
        stringifiedData
      ) as LocallyStoredTeamPreferences
      setCurrentTeamPreferences(locallyStoredDatas[team.id] || {})
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(error.message)
    }
  }, [team])

  // SAVE CHANGES TO LOCALSTORAGE
  useEffect(() => {
    if (team == null) {
      return
    }
    let baseData = localLiteStorage.getItem(teamPreferenceskey)
    if (baseData == null) {
      baseData = '{}'
    }
    const data = JSON.parse(baseData)
    data[team!.id] = currentTeamPreferences
    localLiteStorage.setItem(teamPreferenceskey, JSON.stringify(data))
  }, [currentTeamPreferences, team])

  return {
    teamPreferences: currentTeamPreferences,
    setToLocalStorage,
    toggleItem,
  }
}

export const {
  StoreProvider: TeamPreferencesProvider,
  useStore: useTeamPreferences,
} = createStoreContext(useTeamPreferencesStore, 'teamPreferences')
