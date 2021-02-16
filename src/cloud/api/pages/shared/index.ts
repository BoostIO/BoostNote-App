import { SerializedDoc } from '../../../interfaces/db/doc'
import { callApi } from '../../../lib/client'
import { GetInitialPropsParameters } from '../../../interfaces/pages'

export type SharePageDataResponseBody =
  | {
      link: string
      doc: SerializedDoc
      auth: string
      token: string
    }
  | { link: string; requireAction: 'password' }

export async function getSharedPagedData({
  pathname,
  search,
}: GetInitialPropsParameters) {
  const [, , link] = pathname.split('/')
  const data = await callApi<SharePageDataResponseBody>('api/pages/shared', {
    search: search + `&link=${link}`,
  })

  return data
}
