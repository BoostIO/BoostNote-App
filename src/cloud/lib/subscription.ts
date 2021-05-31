import { differenceInDays } from 'date-fns'
import { SerializedSubscription } from '../interfaces/db/subscription'

export const freePlanDocLimit = 30
export const freeTrialPeriodDays = 7

export const freePlanStorageMb = 100
export const standardPlanStorageMb = 1000
export const proPlanStorageMb = 10000

export const revisionHistoryStandardDays = 7
export const newTeamDiscountDays = 7

export function isEligibleForDiscount(team: { createdAt: string }) {
  if (
    differenceInDays(Date.now(), new Date(team.createdAt)) <=
    newTeamDiscountDays
  ) {
    return true
  }

  return false
}

export const viewerStandardPlanLimit = 10
export const viewerProPlanLimit = 500
export function getViewerLimit(subscription?: SerializedSubscription) {
  if (subscription == null || subscription.status === 'inactive') {
    return 0
  }

  if (subscription.plan === 'standard') {
    return viewerStandardPlanLimit
  }

  return viewerProPlanLimit
}
