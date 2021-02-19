import { callApi } from '../../lib/client'
import {
  RedirectToPageResponseBody,
  GetInitialPropsParameters,
} from '../../interfaces/pages'

export type UserIndexPageResponseBody = RedirectToPageResponseBody | {}

export async function getUserIndexPageData({
  search,
  signal,
}: GetInitialPropsParameters) {
  const data = await callApi<UserIndexPageResponseBody>('api/pages', {
    search,
    signal,
  })

  return data
}
