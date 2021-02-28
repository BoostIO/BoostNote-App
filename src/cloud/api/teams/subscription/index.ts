/* eslint-disable @typescript-eslint/no-empty-interface */
import { SerializedTeam } from '../../../interfaces/db/team'
import { callApi } from '../../../lib/client'
import { SerializedSubscription } from '../../../interfaces/db/subscription'
import report from '../../../lib/analytics'

export interface WithPromoCode {
  code?: string
}

export interface CreateSubscriptionRequestBody extends WithPromoCode {
  source: string
  email: string
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
  report('create_sub')
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
  report('cancel_sub')
  return data
}

export async function reactivateSubscription(
  teamId: string,
  body: WithPromoCode
) {
  const data = await callApi<ReactivateSubscriptionResponseBody>(
    `api/teams/${teamId}/subscription/reactivate`,
    { method: 'post', json: body }
  )
  report('create_sub')
  return data
}

export async function redeemPromo(teamId: string, body: WithPromoCode) {
  await callApi(`api/teams/${teamId}/subscription/promotion`, {
    method: 'post',
    json: body,
  })
}
