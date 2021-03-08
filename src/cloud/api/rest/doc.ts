import { SerializedDoc } from '../../interfaces/db/doc'
import { callApi } from '../../lib/client'

interface DocCreateRequestBody {
  content: string
  title: string
  workspaceId: string
  path: string
  tags: string[]
  teamId: string
  generated?: boolean
  events?: boolean
}

interface DocCreateResponseBody {
  doc: SerializedDoc
}

export function createDocREST(body: DocCreateRequestBody) {
  return callApi<DocCreateResponseBody>(`api/docs`, {
    method: 'post',
    json: body,
  })
}
