import { callApi } from '../../../lib/client'

export type ListPropertySuggestionsRequestBody = {
  team: string
  propertyType?: string
  jsonPropertyType?: string
}

export interface ListPropertySuggestionsResponseBody {
  data: { name: string; type: string }[]
}

export async function listPropertySuggestions(
  body: ListPropertySuggestionsRequestBody
) {
  return callApi<ListPropertySuggestionsResponseBody>(
    `/api/props/suggestions`,
    {
      search: body,
      method: 'get',
    }
  )
}
