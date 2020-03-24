const BASE_URL = process.env.BOOST_NOTE_BASE_URL

interface Options {
  path: string
  method?: string
  token?: string
  body?: any
}

const apiFetch = ({ path, method = 'GET', token, body }: Options) => {
  const opts: any = {
    method,
    headers: [['accept', 'application/json']],
  }

  if (body != null) {
    opts.headers.push(['Content-Type', 'application/json'])
    opts.body = JSON.stringify(body)
  }

  if (token != null) {
    opts.headers.push(['Authorization', `Bearer ${token}`])
  }

  const url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`

  return fetch(url, opts)
}

const wrapMethod = (method: string) => {
  return (path: string, opts: Omit<Options, 'method' | 'path'>) => {
    return apiFetch({ path, method, ...opts })
  }
}

export const apiGet = wrapMethod('GET')

export const apiPut = wrapMethod('PUT')

export const apiPost = wrapMethod('POST')

export const apiDelete = wrapMethod('DELETE')

export const buildCloudSyncUrl = (storageId: number, userId: number) =>
  `${BASE_URL}/api/users/${userId}/storages/${storageId}/db`
