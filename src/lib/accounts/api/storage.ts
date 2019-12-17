import { apiPost, apiGet, apiDelete } from './utils'

export interface CloudStorage {
  id: number
  name: string
  size: number
}

interface User {
  token: string
}

type CreateResponse = 'SubscriptionRequired' | CloudStorage
type GetResponse = CloudStorage[]

export const createStorage = async (
  name: string,
  { token }: User
): Promise<CreateResponse> => {
  const response = await apiPost(`/api/storages`, { token, body: { name } })

  switch (response.status) {
    case 403:
      return 'SubscriptionRequired'
    case 200:
      return response.json()
    default:
      throw new Error('NetworkError')
  }
}

export const getStorages = async ({ token }: User): Promise<GetResponse> => {
  const response = await apiGet('/api/storages', { token })

  switch (response.status) {
    case 200:
      return response.json()
    case 401:
      throw new Error('InvalidUser')
    default:
      throw new Error('NetworkError')
  }
}

export const renameStorage = async (
  { token }: User,
  id: number,
  name: string
): Promise<'Ok'> => {
  const response = await apiPost(`/api/storages/${id}`, {
    token,
    body: { name }
  })

  switch (response.status) {
    case 200:
      return 'Ok'
    case 401:
      throw new Error('InvalidUser')
    case 404:
      throw new Error('NotFound')
    default:
      throw new Error('NetworkError')
  }
}

export const deleteStorage = async (
  { token }: User,
  id: number
): Promise<'Ok'> => {
  const response = await apiDelete(`/api/storages/${id}`, {
    token
  })

  switch (response.status) {
    case 200:
      return 'Ok'
    case 401:
      throw new Error('InvalidUser')
    case 404:
      throw new Error('NotFound')
    default:
      throw new Error('NetworkError')
  }
}
