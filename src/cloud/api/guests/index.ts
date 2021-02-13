import { ParsedUrlQueryInput, stringify } from 'querystring'
import { SerializedGuest } from '../../interfaces/db/guest'
import { callApi } from '../../lib/client'

export interface CreateGuestRequestBody {
  teamId: string
  inviteId: string
  userId: string
}

export interface CreateGuestResponseBody {
  guest: SerializedGuest
}

export async function createGuest(body: CreateGuestRequestBody) {
  const data = await callApi<CreateGuestResponseBody>(`/api/guests`, {
    json: body,
    method: 'post',
  })
  return data
}

interface GetGuestsRequestBody extends ParsedUrlQueryInput {
  teamId: string
  orderBy?: string
}

export interface GetGuestsResponseBody {
  guests: SerializedGuest[]
}

export async function getGuests(filters: GetGuestsRequestBody) {
  return callApi<GetGuestsResponseBody>(`/api/guests?${stringify(filters)}`)
}

export interface DeleteGuestDocResponseBody {
  guest?: SerializedGuest
}

export async function deleteGuestDoc(guestId: string, docId: string) {
  return callApi<DeleteGuestDocResponseBody>(
    `/api/guests/${guestId}/docs/${docId}`,
    {
      method: 'delete',
    }
  )
}

interface GetGuestsEmailsRequestBody extends ParsedUrlQueryInput {
  teamId: string
  orderBy?: string
}

export interface GetGuestsEmailsResponseBody {
  guestsEmails: { id: string; email: string }[]
}

export async function getGuestsEmails(filters: GetGuestsEmailsRequestBody) {
  return callApi<GetGuestsEmailsResponseBody>(
    `/api/guests/emails?${stringify(filters)}`
  )
}
