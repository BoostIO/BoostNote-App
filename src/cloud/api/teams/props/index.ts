import {
  PropSubType,
  PropType,
  StaticPropType,
} from '../../../interfaces/db/props'
import { callApi } from '../../../lib/client'

export type ListPropertySuggestionsRequestBody = {
  team: string
  workspace?: string
  folder?: string
  propertyType?: string
  jsonPropertyType?: string
}

export interface ListPropertySuggestionsResponseBody {
  data: {
    name: string
    type: StaticPropType | PropType
    subType?: PropSubType
  }[]
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
