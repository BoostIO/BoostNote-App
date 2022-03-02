/* eslint-disable @typescript-eslint/no-empty-interface */
import { SerializedTeam } from '../../../interfaces/db/team'
import { callApi } from '../../../lib/client'
import { SerializedSubscription } from '../../../interfaces/db/subscription'
import { SubscriptionPeriod, UpgradePlans } from '../../../lib/stripe'

export interface WithPromoCode {
  code?: string
}

export interface CreateSubscriptionRequestBody extends WithPromoCode {
  source: string
  email: string
  plan: UpgradePlans
  period: SubscriptionPeriod
}

export interface CreateSubscriptionResponseBody {
  requiresAction: boolean
  clientSecret: string
  subscription: SerializedSubscription
}

export interface CreateSubscriptionTrialResponseBody {
  subscription: SerializedSubscription
}

export interface GetTeamSubscriptionResponseBody {
  subscription?: SerializedSubscription
}

export interface CancelSubscriptionResponseBody {
  subscription: SerializedSubscription
}

export interface ReactivateSubscriptionResponseBody {
  subscription: SerializedSubscription
}

export interface GetPromoResponseBody {
  code: string
}

export async function createSubscription(
  team: SerializedTeam,
  body: CreateSubscriptionRequestBody
) {
  const data = await callApi<CreateSubscriptionResponseBody>(
    `api/teams/${team.id}/subscription`,
    {
      json: body,
      method: 'post',
    }
  )
  return data
}

export async function getTeamSubscription(team: SerializedTeam) {
  const data = await callApi<GetTeamSubscriptionResponseBody>(
    `api/teams/${team.id}/subscription`
  )
  return data
}

export async function cancelSubscription(teamId: string) {
  const data = await callApi<CancelSubscriptionResponseBody>(
    `api/teams/${teamId}/subscription`,
    {
      method: 'delete',
    }
  )
  return data
}

export async function redeemPromo(teamId: string, body: WithPromoCode) {
  const data = await callApi(`api/teams/${teamId}/subscription/redeem`, {
    method: 'post',
    json: body,
  })
  return data as {
    subscription: SerializedSubscription
  }
}

export async function getPromo(teamId: string, key: string) {
  const data = await callApi<GetPromoResponseBody>(
    `api/teams/${teamId}/subscription/promotion`,
    { search: { key } }
  )
  return data
}
