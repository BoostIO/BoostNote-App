import { SerializedDoc } from '../../../interfaces/db/doc'
import { callApi } from '../../../lib/client'
import { GetInitialPropsParameters } from '../../../interfaces/pages'

export type SharePageDataResponseBody =
  | {
      link: string
      doc: SerializedDoc
    }
  | { link: string; requireAction: 'password' }

export async function getSharedPagedData({
  search,
}: GetInitialPropsParameters) {
  const data = await callApi<SharePageDataResponseBody>('api/pages/shared', {
    search,
  })

  return data
}
