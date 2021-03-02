import { SerializedSubscription } from '../../../interfaces/db/subscription'
import { callApi } from '../../../lib/client'
import report from '../../../lib/analytics'
import { UpgradePlans } from '../../../lib/stripe'

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

export interface UpdateSubscriptionPlanRequestBody {
  plan: UpgradePlans
}

export async function updateSubPlan(
  teamId: string,
  body: UpdateSubscriptionPlanRequestBody
) {
  const data = await callApi<UpdatePaymentInfoResponseBody>(
    `api/teams/${teamId}/subscription/plan`,
    {
      json: body,
      method: 'put',
    }
  )
  return data
}
