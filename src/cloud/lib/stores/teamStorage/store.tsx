import { useState, useCallback, useEffect } from 'react'
import { createStoreContext } from '../../utils/context'
import { usePage } from '../pageStore'
import { localLiteStorage } from 'ltstrg'
import { teamStorageKey } from '../../localStorageKeys'
import {
  TeamStorageContext,
  LocallyStoredTeamPreferences,
  TeamStorage,
} from './types'

const initialContent: TeamStorage = {
  showRoleUpgradeAlert: true,
  showTrialAlert: true,
}

function useTeamStorageStore(): TeamStorageContext {
  const { team } = usePage()
  const [teamPreferences, setTeamPreferences] = useState<TeamStorage>({})

  const setToLocalStorage = useCallback(
    (teamId: string, content: TeamStorage) => {
      let baseData = localLiteStorage.getItem(teamStorageKey)
      if (baseData == null) {
        baseData = '{}'
      }
      const data = JSON.parse(baseData)
      data[teamId] = content
      setTeamPreferences(content)
      localLiteStorage.setItem(teamStorageKey, JSON.stringify(data))
    },
    []
  )

  useEffect(() => {
    if (team == null) {
      return
    }

    try {
      const stringifiedData = localLiteStorage.getItem(teamStorageKey)
      if (stringifiedData == null) {
        setTeamPreferences(initialContent)
        return
      }
      const locallyStoredDatas = JSON.parse(
        stringifiedData
      ) as LocallyStoredTeamPreferences
      setTeamPreferences(locallyStoredDatas[team.id] || initialContent)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(error.message)
    }
  }, [team])

  return {
    teamPreferences,
    setToLocalStorage,
  }
}

export const {
  StoreProvider: TeamStorageProvider,
  useStore: useTeamStorage,
} = createStoreContext(useTeamStorageStore, 'teamStorage')
