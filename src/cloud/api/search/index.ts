import { SerializedFolder } from '../../interfaces/db/folder'
import { SerializedDoc } from '../../interfaces/db/doc'
import { SerializedTeam } from '../../interfaces/db/team'
import { callApi } from '../../lib/client'

type SerializedFolderSearchResult = {
  type: 'folder'
  result: SerializedFolder
}

type SerializedDocSearchResult = {
  type: 'doc'
  result: SerializedDoc
}

type SerializedDocContentSearchResult = {
  type: 'docContent'
  result: SerializedDoc
  context: string
}

export type SearchResult =
  | SerializedFolderSearchResult
  | SerializedDocSearchResult
  | SerializedDocContentSearchResult

export type HistoryItem = { type: 'folder' | 'doc'; item: string }

export interface GetSearchResultsRequestQuery {
  query: string
  body?: boolean
  title?: boolean
  parentFolderId?: string
  tagId?: string
  archived?: boolean
}

export interface GetSearchResultsResponseBody {
  results: SearchResult[]
}

export async function getSearchResults(
  team: SerializedTeam,
  query: GetSearchResultsRequestQuery
) {
  return callApi<GetSearchResultsResponseBody>(`api/teams/${team.id}/search`, {
    search: query as any,
  })
}

export async function getSearchResultsV2({
  teamId,
  query,
}: {
  teamId: string
  query: any
}) {
  return callApi<GetSearchResultsResponseBody>(`api/teams/${teamId}/search`, {
    search: query as any,
  })
}
