import { ParsedUrlQueryInput, stringify } from 'querystring'
import { SerializedGuestInvite } from '../../interfaces/db/guest'
import { callApi } from '../../lib/client'

interface GetGuestInvitesRequestBody extends ParsedUrlQueryInput {
  teamId: string
  orderBy?: string
}

export interface GetGuestInvitesResponseBody {
  invites: SerializedGuestInvite[]
}

export async function getGuestInvites(filters: GetGuestInvitesRequestBody) {
  return callApi<GetGuestInvitesResponseBody>(
    `api/guests/invites?${stringify(filters)}`
  )
}

interface CreateInviteRequestBody {
  email: string
  docId: string
  teamId: string
}

export interface CreateGuestInviteResponseBody {
  invite: SerializedGuestInvite
}

export async function createGuestInvite(body: CreateInviteRequestBody) {
  return callApi<CreateGuestInviteResponseBody>(`api/guests/invites`, {
    json: body,
    method: 'post',
  })
}

export async function cancelGuestInvite(inviteId: string) {
  return callApi<any>(`api/guests/invites/${inviteId}`, { method: 'delete' })
}
