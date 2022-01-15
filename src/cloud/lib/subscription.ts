import { differenceInDays } from 'date-fns'
import { SerializedDoc } from '../interfaces/db/doc'
import { SerializedSubscription } from '../interfaces/db/subscription'
import { SerializedUserTeamPermissions } from '../interfaces/db/userTeamPermissions'
import { filterIter } from './utils/iterator'

export const freePlanDocLimit = 30
export const freeTrialPeriodDays = 7

export const freePlanStorageMb = 100
export const standardPlanStorageMb = 1000
export const proPlanStorageMb = 10000

export const revisionHistoryFreeDays = 3
export const revisionHistoryStandardDays = 7
export const newTeamDiscountDays = 7

export const freePlanMembersLimit = 9999

export const freePlanUploadSizeMb = 10
export const paidPlanUploadSizeMb = 200

export const freePlanSmartViewPerDashboardLimit = 4
export const freePlanDashboardPerUserPerTeamLimit = 1

export function isTimeEligibleForDiscount(team: { createdAt: string }) {
  if (
    differenceInDays(Date.now(), new Date(team.createdAt)) <=
    newTeamDiscountDays
  ) {
    return true
  }

  return false
}

export function didTeamReachPlanLimit(
  permissions: SerializedUserTeamPermissions[],
  subscription?: SerializedSubscription
): boolean {
  if (subscription != null && subscription.status !== 'inactive') {
    return false
  }

  if (
    ((permissions || []) as any[]).filter((p) => p.role !== 'viewer').length >=
    freePlanMembersLimit
  ) {
    return true
  }

  return false
}

export function canCreatePrivateFolders(
  subscription?: SerializedSubscription
): boolean {
  return subscription != null && subscription.plan === 'pro'
}

export function canCreateDoc(
  docs: SerializedDoc[],
  subscription?: SerializedSubscription
): boolean {
  return (
    subscription != null ||
    filterIter((doc) => doc.generated === false, docs).length <=
      freePlanDocLimit
  )
}
