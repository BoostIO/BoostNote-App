import { getAccessToken, usingElectron } from './stores/electron'
import ky from 'ky'
import { boostHubBaseUrl } from './consts'

interface CallCloudJsonApiParameter {
  headers?: any
  method?: 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options'
  search?:
    | string
    | { [key: string]: string | number | boolean }
    | Array<Array<string | number | boolean>>
    | URLSearchParams
  signal?: AbortSignal
  json?: any
  body?:
    | Blob
    | BufferSource
    | FormData
    | URLSearchParams
    | ReadableStream<Uint8Array>
    | string
}

export async function callApi<T = any>(
  pathname: string,
  {
    method = 'get',
    search,
    headers = {},
    signal,
    json,
    body,
  }: CallCloudJsonApiParameter = {}
) {
  const mergedHeaders = {
    ...headers,
  }
  const accessToken = getAccessToken()
  if (accessToken != null) {
    mergedHeaders['Authorization'] = `Bearer ${accessToken}`
  }
  return ky(pathname, {
    prefixUrl: boostHubBaseUrl,
    headers: mergedHeaders,
    method,
    searchParams: search,
    signal,
    json,
    body,
    timeout: 60 * 1000,
    credentials: usingElectron ? undefined : 'include',
  }).json() as Promise<T>
}
