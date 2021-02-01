import { callApi } from '../../../lib/client'
import querystring from 'querystring'

export interface GetUserEmailsFromPermissionsResponseBody {
  permissionEmails: { id: string; email: string }[]
}

export async function getUserEmailsFromPermissions(
  teamId: string,
  ids: string[]
) {
  const data = await callApi<GetUserEmailsFromPermissionsResponseBody>(
    `api/teams/${teamId}/permissions/emails`,
    {
      search: querystring.stringify({
        ids,
      }),
    }
  )
  return data
}
