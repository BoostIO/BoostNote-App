import {
  RedirectToPageResponseBody,
  GetInitialPropsParameters,
} from '../../interfaces/pages'
import { SerializedUser } from '../../interfaces/db/user'
import { SerializedTeam } from '../../interfaces/db/team'
import { callApi } from '../../lib/client'

export async function getAuthCallbackData(search: string) {
  const data = await callApi<RedirectToPageResponseBody>(
    'api/oauth/boostid/callback',
    {
      search,
    }
  )

  return data
}

export async function getSignOutData() {
  const data = await callApi<RedirectToPageResponseBody>('api/user/signout')

  return data
}

export interface OAuthPageData {
  user: SerializedUser
  clientName: string
  teams: SerializedTeam[]
  scope: string[]
}

export async function getOAuthPageData({
  search,
  signal,
}: GetInitialPropsParameters) {
  const data = await callApi<OAuthPageData>('api/pages/oauth2/authorize', {
    search,
    signal,
  })

  return data
}
