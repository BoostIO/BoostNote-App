import { callApi } from '../../lib/client'

interface ListDocTokenResponseBody {
  data: string
}

export async function getDocCollaborationToken(docId: string) {
  const result = await callApi<ListDocTokenResponseBody>(
    `api/docs/${docId}/token`
  )
  return result
}
