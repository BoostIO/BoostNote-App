import {
  getAccessToken,
  usingElectron,
  usingLegacyElectron,
} from './stores/electron'
import ky from 'ky'
import { boostHubBaseUrl, boostPdfExportBaseUrl, mockBackend } from './consts'
import { mockHandler } from '../api/mock/mockHandler'

export interface CallCloudJsonApiParameter {
  headers?: any
  method?: 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options'
  search?:
    | string
    | { [key: string]: string | number | boolean }
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
  if (mockBackend) {
    return mockHandler(pathname, {
      method,
      search,
      headers,
      signal,
      json,
      body,
    }) as any as T
  }
  const mergedHeaders = {
    ...headers,
  }
  const accessToken = getAccessToken()
  if (
    usingLegacyElectron &&
    usingElectron &&
    accessToken != null &&
    mergedHeaders['Authorization'] == null
  ) {
    mergedHeaders['Authorization'] = `Bearer ${accessToken}`
  }
  return ky(pathname.startsWith('/') ? pathname.substring(1) : pathname, {
    prefixUrl: boostHubBaseUrl,
    headers: mergedHeaders,
    method,
    searchParams: search,
    signal,
    json,
    body,
    timeout: 60 * 1000,
    credentials: usingElectron ? undefined : 'include',
    retry: 0,
  }).json() as Promise<T>
}

export async function callPdfApi<T = any>(
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
  if (mockBackend) {
    return mockHandler(pathname, {
      method,
      search,
      headers,
      signal,
      json,
      body,
    }) as any as T
  }
  const mergedHeaders = {
    ...headers,
  }
  const accessToken = getAccessToken()
  if (
    usingElectron &&
    accessToken != null &&
    mergedHeaders['Authorization'] == null
  ) {
    mergedHeaders['Authorization'] = `Bearer ${accessToken}`
  }

  return ky(pathname.startsWith('/') ? pathname.substring(1) : pathname, {
    prefixUrl: boostPdfExportBaseUrl,
    headers: mergedHeaders,
    method,
    searchParams: search,
    signal,
    json,
    body,
    timeout: 60 * 1000,
    credentials: usingElectron ? undefined : 'include',
    retry: 0,
  }).json() as Promise<T>
}
