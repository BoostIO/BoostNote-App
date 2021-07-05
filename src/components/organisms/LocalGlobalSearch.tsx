import React, { useCallback, useMemo, useState } from 'react'
import { useRouter } from '../../lib/router'
import SearchLayout, {
  GlobalSearchResult,
} from '../../shared/components/organisms/SearchLayout'
import { mapHistory } from '../../lib/v2/mappers/local/sidebarHistory'
import useApi from '../../shared/lib/hooks/useApi'
import { useDebounce } from 'react-use'
import {
  GetSearchResultsRequestQuery,
  NoteSearchData,
} from '../../lib/search/search'
import {
  getSearchResultItems,
  mapSearchResults,
} from '../../lib/v2/mappers/local/searchResults'
import { NoteStorage } from '../../lib/db/types'

interface LocalGlobalSearchProps {
  workspace?: NoteStorage
}

const LocalGlobalSearch = ({ workspace }: LocalGlobalSearchProps) => {
  const { push } = useRouter()
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<GlobalSearchResult[]>([])
  const setSearchQuery = useCallback((val: string) => {
    setSidebarSearchQuery(val)
  }, [])

  const historyItems = useMemo(() => {
    if (workspace == null) {
      return []
    }
    return mapHistory(
      // implement history items for search
      [],
      push,
      workspace.noteMap,
      workspace.folderMap,
      workspace
    )
  }, [push, workspace])

  const { submit: submitSearch, sending: fetchingSearchResults } = useApi<
    { query: any },
    { results: NoteSearchData[] }
  >({
    api: ({ query }: { query: any }) => {
      return Promise.resolve({
        results: getSearchResultItems(workspace, query.query),
      })
    },
    cb: ({ results }) => {
      setSearchResults(mapSearchResults(results, push, workspace))
    },
  })

  const [isNotDebouncing, cancel] = useDebounce(
    async () => {
      if (workspace == null || sidebarSearchQuery.trim() === '') {
        return
      }

      if (fetchingSearchResults) {
        cancel()
      }

      const searchParams = sidebarSearchQuery
        .split(' ')
        .reduce<GetSearchResultsRequestQuery>(
          (params, str) => {
            if (str === '--body') {
              params.body = true
              return params
            }
            if (str === '--title') {
              params.title = true
              return params
            }
            params.query = params.query == '' ? str : `${params.query} ${str}`
            return params
          },
          { query: '' }
        )

      // todo: implement search history for local space
      // addToSearchHistory(searchParams.query)
      await submitSearch({ query: searchParams })
    },
    600,
    [sidebarSearchQuery]
  )

  const sidebarSearchState = useMemo(() => {
    return {
      fetching: fetchingSearchResults,
      isNotDebouncing: isNotDebouncing() === true,
    }
  }, [isNotDebouncing, fetchingSearchResults])

  return (
    <SearchLayout
      searchPlaceholder={'Search...'}
      recentlySearched={[]}
      recentlyVisited={historyItems}
      searchQuery={sidebarSearchQuery}
      setSearchQuery={setSearchQuery}
      searchResults={searchResults}
      searchState={sidebarSearchState}
    />
  )
}

export default LocalGlobalSearch
