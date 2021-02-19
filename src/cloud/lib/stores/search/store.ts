import { useState, useCallback, useEffect } from 'react'
import { createStoreContext } from '../../utils/context'
import { SearchContext } from './types'
import { HistoryItem } from '../../../api/search'
import { localLiteStorage } from 'ltstrg'
import { searchKey, searchHistoryKey } from '../../localStorageKeys'
import { SerializedDoc } from '../../../interfaces/db/doc'
import { SerializedFolder } from '../../../interfaces/db/folder'
import { usePage } from '../pageStore'
import { trackEvent } from '../../../api/track'
import { MixpanelActionTrackTypes } from '../../../interfaces/analytics/mixpanel'

const recentPagesLimit = 5
const historySearchLimit = 3

type LocallyStoredHistoryProps = {
  [teamId: string]: HistoryItem[]
}

type LocallyStoredSearchHistoryProps = {
  [teamId: string]: string[]
}

function useSearchStore(): SearchContext {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const { team, pageFolder, pageDoc } = usePage()
  const [showGlobalSearch, setGlobalSearch] = useState<boolean>(false)

  const setShowGlobalSearch = useCallback((val: boolean) => {
    if (val) {
      trackEvent(MixpanelActionTrackTypes.SearchOpen)
    }
    setGlobalSearch(val)
  }, [])

  const addToSearchHistory = useCallback((newSearch: string) => {
    if (newSearch.trim() === '') {
      return
    }
    return setSearchHistory((prev) => {
      const old =
        prev != null
          ? prev.filter((prevItem) => prevItem.trim() !== newSearch.trim())
          : []
      return [newSearch, ...old].slice(0, historySearchLimit)
    })
  }, [])

  const addVisitedToHistory = useCallback(
    (item: SerializedDoc | SerializedFolder) => {
      let historyItem: HistoryItem
      if ('head' in item) {
        historyItem = {
          type: 'doc',
          item: item.id,
        }
      } else {
        historyItem = { type: 'folder', item: item.id }
      }

      setHistory((prevHistory = []) => {
        const newHistory = [...prevHistory]
          .filter((val) => val.item !== historyItem.item)
          .slice(0, recentPagesLimit - 1)

        newHistory.unshift(historyItem)
        return newHistory
      })
    },
    []
  )

  // LOAD FROM LOCAL STORAGE
  useEffect(() => {
    if (team == null) {
      return
    }
    try {
      const stringifiedData = localLiteStorage.getItem(searchKey)
      if (stringifiedData == null) {
        return
      }
      const locallyStoredDatas = JSON.parse(
        stringifiedData
      ) as LocallyStoredHistoryProps
      const locallyStoredIds = locallyStoredDatas[team.id]
      setHistory(locallyStoredIds)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(error.message)
    }

    try {
      const stringifiedSearchData = localLiteStorage.getItem(searchHistoryKey)
      if (stringifiedSearchData == null) {
        return
      }
      const locallyStoredSearchData = JSON.parse(
        stringifiedSearchData
      ) as LocallyStoredSearchHistoryProps
      const locallyStoredResults = locallyStoredSearchData[team.id]
      setSearchHistory(locallyStoredResults)
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
    let baseData = localLiteStorage.getItem(searchKey)
    if (baseData == null) {
      baseData = '{}'
    }
    const data = JSON.parse(baseData)
    data[team!.id] = history
    localLiteStorage.setItem(searchKey, JSON.stringify(data))
  }, [history, team])

  useEffect(() => {
    if (team == null) {
      return
    }
    let baseData = localLiteStorage.getItem(searchHistoryKey)
    if (baseData == null) {
      baseData = '{}'
    }
    const data = JSON.parse(baseData)
    data[team!.id] = searchHistory
    localLiteStorage.setItem(searchHistoryKey, JSON.stringify(data))
  }, [searchHistory, team])

  // RECORD HISTORY
  useEffect(() => {
    if (pageDoc != null) {
      addVisitedToHistory(pageDoc as SerializedDoc)
    }
    if (pageFolder != null) {
      addVisitedToHistory(pageFolder as SerializedFolder)
    }
  }, [pageDoc, pageFolder, addVisitedToHistory])

  return {
    history,
    searchHistory,
    addToSearchHistory,
    showGlobalSearch,
    setShowGlobalSearch,
  }
}

export const {
  StoreProvider: SearchProvider,
  useStore: useSearch,
} = createStoreContext(useSearchStore, 'search')
