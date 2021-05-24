import { UpgradePlans } from '../../lib/stripe'

export interface SerializeableSubscriptionProps {
  id: string
  plan: UpgradePlans
  customerId: string
  subscriptionId: string
  discountId?: string
  seats: number
  status:
    | 'active'
    | 'past_due'
    | 'incomplete'
    | 'canceled'
    | 'inactive'
    | 'trialing'
  cardBrand?: string
  last4?: string
  trialEnd: number
  currentPeriodEnd: number
  email: string
  teamId: string
  team: string
}

export interface SerializedUnserializableSubscriptionsProps {
  createdAt: string
  updatedAt: string
}

export type SerializedSubscription = SerializeableSubscriptionProps &
  SerializeableSubscriptionProps
