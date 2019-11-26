import { apiPost, apiGet } from './utils'

export interface CloudStorage {
  id: number
  active: boolean
  name: string
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
    default:
      throw new Error('NetworkError')
  }
}
