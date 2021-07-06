import React, { useCallback, useMemo, useState } from 'react'
import { mdiFileDocumentOutline } from '@mdi/js'
import { useDebounce } from 'react-use'
import {
  GlobalSearchHistory,
  GlobalSearchResult,
} from '../../../shared/components/organisms/SearchLayout'
import useApi from '../../../shared/lib/hooks/useApi'
import {
  GetSearchResultsRequestQuery,
  getSearchResultsV2,
  HistoryItem,
  SearchResult,
} from '../../api/search'
import { SerializedDoc } from '../../interfaces/db/doc'
import { SerializedFolder } from '../../interfaces/db/folder'
import { SerializedTeam } from '../../interfaces/db/team'
import { useRouter } from '../../lib/router'
import { useSearch } from '../../lib/stores/search'
import { getDocTitle } from '../../lib/utils/patterns'
import { getDocLinkHref } from '../atoms/Link/DocLink'
import { getFolderHref } from '../atoms/Link/FolderLink'
import SearchLayout from '../../../shared/components/organisms/SearchLayout'
import { useNav } from '../../lib/stores/nav'
import { useI18n } from '../../lib/hooks/useI18n'
import { lngKeys } from '../../lib/i18n/types'

const contextHighlightStart = '<zxNptFF>'
const contextHightlightEnd = '</zxNptFF>'

interface CloudGlobalSearchProps {
  team?: SerializedTeam
}

const CloudGlobalSearch = ({ team }: CloudGlobalSearchProps) => {
  const {
    addToSearchHistory,
    searchHistory,
    history,
    setShowSearchScreen,
  } = useSearch()
  const { push } = useRouter()
  const { translate } = useI18n()
  const [searchQuery, setStateSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<GlobalSearchResult[]>([])
  const setSearchQuery = useCallback((val: string) => {
    setStateSearchQuery(val)
  }, [])
  const { docsMap, foldersMap } = useNav()

  const { submit: submitSearch, sending: fetchingSearchResults } = useApi({
    api: ({ teamId, query }: { teamId: string; query: any }) =>
      getSearchResultsV2({ teamId, query }),
    cb: ({ results }) =>
      setSearchResults(mapSearchResults(results, push, team)),
  })

  const [isNotDebouncing, cancel] = useDebounce(
    async () => {
      if (team == null || searchQuery.trim() === '') {
        return
      }

      if (fetchingSearchResults) {
        cancel()
      }

      const searchParams = searchQuery
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

      addToSearchHistory(searchParams.query)
      await submitSearch({ teamId: team.id, query: searchParams })
    },
    600,
    [searchQuery]
  )

  const sidebarSearchState = useMemo(() => {
    return {
      fetching: fetchingSearchResults,
      isNotDebouncing: isNotDebouncing() === true,
    }
  }, [isNotDebouncing, fetchingSearchResults])

  const historyItems = useMemo(() => {
    return mapHistory(history || [], push, docsMap, foldersMap, team)
  }, [team, history, push, docsMap, foldersMap])

  return (
    <SearchLayout
      searchPlaceholder={`${translate(lngKeys.GeneralSearchVerb)}...`}
      recentlySearched={searchHistory}
      recentlyVisited={historyItems}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      searchResults={searchResults}
      searchState={sidebarSearchState}
      closeSearch={() => setShowSearchScreen(false)}
    />
  )
}

export default CloudGlobalSearch

function mapSearchResults(
  results: SearchResult[],
  push: (url: string) => void,
  team?: SerializedTeam
) {
  if (team == null) {
    return []
  }

  return results.reduce((acc, item) => {
    if (item.type === 'folder') {
      const href = `${process.env.BOOST_HUB_BASE_URL}${getFolderHref(
        item.result,
        team,
        'index'
      )}`
      acc.push({
        label: item.result.name,
        href,
        emoji: item.result.emoji,
        onClick: () => push(href),
      })
      return acc
    }

    const href = `${process.env.BOOST_HUB_BASE_URL}${getDocLinkHref(
      item.result,
      team,
      'index'
    )}`
    acc.push({
      label: getDocTitle(item.result, 'Untitled'),
      href,
      defaultIcon: mdiFileDocumentOutline,
      emoji: item.result.emoji,
      contexts:
        item.type === 'docContent' ? [highlightMatch(item.context)] : undefined,
      onClick: () => push(href),
    })
    return acc
  }, [] as GlobalSearchResult[])
}

function highlightMatch(context: string) {
  const delimiters = [contextHighlightStart, contextHightlightEnd]
  const parts = context.split(
    new RegExp(`(${contextHighlightStart}|${contextHightlightEnd})`, 'g')
  )
  return (
    <span>
      {parts.map((part: string, i: number) =>
        delimiters.includes(part) ? (
          ''
        ) : parts[i - 1] === contextHighlightStart &&
          parts[i + 1] === contextHightlightEnd ? (
          <span className='search__highlight' key={i}>
            {part}
          </span>
        ) : (
          part
        )
      )}
    </span>
  )
}

function mapHistory(
  history: HistoryItem[],
  push: (href: string) => void,
  docsMap: Map<string, SerializedDoc>,
  foldersMap: Map<string, SerializedFolder>,
  team?: SerializedTeam
) {
  if (team == null) {
    return []
  }

  const items = [] as GlobalSearchHistory[]

  history.forEach((historyItem) => {
    if (historyItem.type === 'folder') {
      const item = foldersMap.get(historyItem.item)
      if (item != null) {
        const href = `${process.env.BOOST_HUB_BASE_URL}${getFolderHref(
          item,
          team,
          'index'
        )}`
        items.push({
          emoji: item.emoji,
          label: item.name,
          path: item.pathname,
          href,
          onClick: () => push(href),
        })
      }
    } else {
      const item = docsMap.get(historyItem.item)
      if (item != null) {
        const href = `${process.env.BOOST_HUB_BASE_URL}${getDocLinkHref(
          item,
          team,
          'index'
        )}`
        items.push({
          emoji: item.emoji,
          defaultIcon: mdiFileDocumentOutline,
          label: getDocTitle(item, 'Untitled'),
          href,
          path: item.folderPathname,
          onClick: () => push(href),
        })
      }
    }
  })

  return items
}
