import { apiPost, apiGet } from './utils'

/**
 * Create storage -> local storage
 * Create storage with cloud -> cloud storage -> local storage -> persist link
 * Link storage -> cloud storage -> persist link
 *
 * Not signed in, can only create 1 storage not linked
 * Signed in, can only create 1 storage and link
 * Signed in with subs, can create ∞ and link
 *
 * NOTE: Storage delete needs to be implemented
 * !! Storage list handler
 * !! Storage create handler should be 401 & 403
 * ?? Storage routes should be flatter /api/storage
 */

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
