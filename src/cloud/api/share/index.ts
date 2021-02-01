import { callApi } from '../../lib/client'
import { SerializedShareLink } from '../../interfaces/db/shareLink'
import { SerializedDoc } from '../../interfaces/db/doc'

export interface ShareLinkResponseBody {
  link: SerializedShareLink
}

export async function createShareLink(doc: SerializedDoc) {
  const data = await callApi<ShareLinkResponseBody>('api/share', {
    json: {
      doc: doc.id,
    },
    method: 'post',
  })
  return data
}

export async function deleteShareLink(link: SerializedShareLink) {
  await callApi(`api/share/${link.id}`, {
    method: 'delete',
  })
}

export async function regenerateShareLink(link: SerializedShareLink) {
  const data = await callApi<ShareLinkResponseBody>(
    `api/share/${link.id}/regenerate`,
    {
      method: 'post',
    }
  )
  return data
}

export type UpdateShareLinkRequestBody = Partial<{
  password: string | boolean
  expireAt: string | boolean
}>

export async function updateShareLink(
  link: SerializedShareLink,
  body: UpdateShareLinkRequestBody
) {
  const data = await callApi<ShareLinkResponseBody>(`api/share/${link.id}`, {
    json: body,
    method: 'put',
  })
  return data
}

export async function getSharedLink(
  link: string,
  query: { password?: string }
) {
  const data = await callApi<ShareLinkResponseBody>(`api/share/${link}`, {
    search: query as any,
  })
  return data
}
