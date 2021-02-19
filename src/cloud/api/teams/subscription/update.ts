import { SerializedSubscription } from '../../../interfaces/db/subscription'
import { callApi } from '../../../lib/client'
import report from '../../../lib/analytics'

export interface UpdatePaymentInfoResponseBody {
  subscription: SerializedSubscription
}

export interface UpdateSubscriptionEmailRequestBody {
  email: string
}

export async function updateSubEmail(teamId: string, email: string) {
  const data = await callApi<UpdatePaymentInfoResponseBody>(
    `api/teams/${teamId}/subscription/email`,
    {
      json: {
        email,
      },
      method: 'put',
    }
  )
  report('update_sub_email')
  return data
}

export interface UpdateSubscriptionMethodRequestBody {
  source: string
}

export async function updateSubMethod(
  teamId: string,
  body: UpdateSubscriptionMethodRequestBody
) {
  const data = await callApi<UpdatePaymentInfoResponseBody>(
    `api/teams/${teamId}/subscription/method`,
    {
      json: body,
      method: 'put',
    }
  )
  report('update_sub_card')
  return data
}

export interface UpdateSubscriptionSeatsRequestBody {
  seats: number
}
