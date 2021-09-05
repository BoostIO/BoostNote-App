import { useState, useCallback } from 'react'
import { GlobalData } from '../../api/global'
import { SerializedTeam } from '../../interfaces/db/team'
import { SerializedUserTeamPermissions } from '../../interfaces/db/userTeamPermissions'
import { useCommittedRef } from '../hooks'
import { createStoreContext } from '../utils/context'

function useGlobalDataStore() {
  const [initialized, setInitialized] = useState(false)
  const [globalData, setGlobalData] = useState<GlobalData>({
    teams: [],
    invites: [],
  })

  const initGlobalData = useCallback(
    (globalData: GlobalData) => {
      setGlobalData(globalData)
      setInitialized(true)
    },
    [setGlobalData, setInitialized]
  )

  const globalDataRef = useCommittedRef(globalData)

  const setPartialGlobalData = useCallback(
    (val: Partial<GlobalData>) => {
      setGlobalData((prevState) => {
        return Object.assign(
          {},
          prevState,
          val instanceof Function ? val(prevState) : val
        )
      })
    },
    [setGlobalData]
  )

  const setTeamInGlobal = useCallback(
    (
      team: SerializedTeam & { permissions: SerializedUserTeamPermissions[] }
    ) => {
      const { teams } = globalData
      const teamIndex = teams.findIndex((t) => t.id === team.id)
      if (teamIndex === -1) {
        teams.push(team)
      } else {
        teams[teamIndex] = team
      }
      setPartialGlobalData({ teams })
    },
    [globalData, setPartialGlobalData]
  )

  return {
    initialized,
    setInitialized,
    initGlobalData,
    globalData,
    globalDataRef,
    setGlobalData,
    setPartialGlobalData,
    setTeamInGlobal,
  }
}

export const {
  StoreProvider: GlobalDataProvider,
  useStore: useGlobalData,
} = createStoreContext(useGlobalDataStore, 'globalData')
