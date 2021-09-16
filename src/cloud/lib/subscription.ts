import { differenceInDays } from 'date-fns'
import { SerializedSubscription } from '../interfaces/db/subscription'
import { SerializedUserTeamPermissions } from '../interfaces/db/userTeamPermissions'

export const freeTrialPeriodDays = 7

export const freePlanStorageMb = 100
export const standardPlanStorageMb = 1000
export const proPlanStorageMb = 10000

export const revisionHistoryFreeDays = 3
export const revisionHistoryStandardDays = 7
export const newTeamDiscountDays = 7

export const freePlanMembersLimit = 3

export const freePlanUploadSizeMb = 10
export const paidPlanUploadSizeMb = 200
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
