import { differenceInDays } from 'date-fns'

export const freeTrialPeriodDays = 7

export const freePlanStorageMb = 100
export const standardPlanStorageMb = 1000
export const proPlanStorageMb = 10000

export const revisionHistoryStandardDays = 3
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
