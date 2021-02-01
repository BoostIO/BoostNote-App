import { useState, useCallback, useMemo, useEffect } from 'react'
import { createStoreContext } from '../../utils/context'
import { usePage } from '../pageStore'
import { localLiteStorage } from 'ltstrg'
import { sidebarCollapseKey } from '../../localStorageKeys'
import {
  SidebarCollapseContext,
  LocallyStoredSidebarCollapse,
  CollapsableContent,
  CollapsableType,
} from './types'

const initialContent: CollapsableContent = {
  folders: [],
  workspaces: [],
  links: [],
}

function useSidebarCollapseStore(): SidebarCollapseContext {
  const { team } = usePage()
  const [currentTeamCollapsable, setCurrentTeamCollapsable] = useState<
    CollapsableContent
  >(initialContent)

  const setToLocalStorage = useCallback(
    (teamId: string, content: CollapsableContent) => {
      let baseData = localLiteStorage.getItem(sidebarCollapseKey)
      if (baseData == null) {
        baseData = '{}'
      }
      const data = JSON.parse(baseData)
      data[teamId] = content
      localLiteStorage.setItem(sidebarCollapseKey, JSON.stringify(data))
    },
    []
  )

  const toggleItem = useCallback((type: CollapsableType, id: string) => {
    setCurrentTeamCollapsable((prev) => {
      const newSet = new Set(prev[type])
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return { ...prev, [type]: [...newSet] }
    })
  }, [])

  const foldItem = useCallback((type: CollapsableType, id: string) => {
    setCurrentTeamCollapsable((prev) => {
      const newSet = new Set(prev[type])
      if (!newSet.has(id)) {
        return prev
      }
      newSet.delete(id)
      return { ...prev, [type]: [...newSet] }
    })
  }, [])

  const unfoldItem = useCallback((type: CollapsableType, id: string) => {
    setCurrentTeamCollapsable((prev) => {
      const newSet = new Set(prev[type])

      if (newSet.has(id)) {
        return prev
      }
      newSet.add(id)
      return { ...prev, [type]: [...newSet] }
    })
  }, [])

  const sideBarOpenedFolderIdsSet = useMemo(() => {
    return new Set(currentTeamCollapsable.folders)
  }, [currentTeamCollapsable])

  const sideBarOpenedWorkspaceIdsSet = useMemo(() => {
    return new Set(currentTeamCollapsable.workspaces)
  }, [currentTeamCollapsable])

  const sideBarOpenedLinksIdsSet = useMemo(() => {
    return new Set(currentTeamCollapsable.links)
  }, [currentTeamCollapsable])

  // LOAD FROM LOCAL STORAGE
  useEffect(() => {
    if (team == null) {
      return
    }

    try {
      const stringifiedData = localLiteStorage.getItem(sidebarCollapseKey)
      if (stringifiedData == null) {
        return
      }
      const locallyStoredDatas = JSON.parse(
        stringifiedData
      ) as LocallyStoredSidebarCollapse
      setCurrentTeamCollapsable(locallyStoredDatas[team.id] || initialContent)
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
    let baseData = localLiteStorage.getItem(sidebarCollapseKey)
    if (baseData == null) {
      baseData = '{}'
    }
    const data = JSON.parse(baseData)
    data[team!.id] = currentTeamCollapsable
    localLiteStorage.setItem(sidebarCollapseKey, JSON.stringify(data))
  }, [currentTeamCollapsable, team])

  return {
    sideBarOpenedFolderIdsSet,
    sideBarOpenedWorkspaceIdsSet,
    sideBarOpenedLinksIdsSet,
    setToLocalStorage,
    toggleItem,
    unfoldItem,
    foldItem,
  }
}

export const {
  StoreProvider: SidebarCollapseProvider,
  useStore: useSidebarCollapse,
} = createStoreContext(useSidebarCollapseStore, 'sidebarCollapse')
