import { apiGet } from './utils'

export interface Subscription {
  id: number
  quantity: number
  status: 'active' | 'past_due' | 'incomplete'
}

type GetResponse = undefined | Subscription

export const getSubscription = async ({
  token
}: {
  token: string
}): Promise<GetResponse> => {
  const response = await apiGet('/api/subscriptions', { token })

  if (!response.ok) {
    throw new Error('NetworkError')
  }

  const data = (await response.json()) as Subscription[]
  return data[0]
}
